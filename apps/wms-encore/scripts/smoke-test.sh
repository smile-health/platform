#!/usr/bin/env bash
# Smoke test for the wms-encore core lifecycle flow — see the "Manual Test Runbook"
# artifact for the curl-by-curl walkthrough this automates.
#
# Exercises real HTTP + Zod validation + Postgres + pub/sub wiring, none of which
# the mocked *.service.test.ts unit suite touches. Run against a live `encore run`.
set -euo pipefail

BASE="${BASE:-http://localhost:4000}"
TOKEN="${TOKEN:-dev-test-token}"
DB_NAME="${DB_NAME:-wms}"
DB_ENV="${DB_ENV:-local}"

RUN_ID="$$-$RANDOM"
QR_CODE="QR-SMOKE-${RUN_ID}"
REGION_CODE="SMOKE-REGION-${RUN_ID}"

pass=0
fail=0

log()  { echo "  $*"; }
step() { echo; echo "== $* =="; }
ok()   { echo "  PASS: $*"; pass=$((pass + 1)); }
bad()  { echo "  FAIL: $*"; fail=$((fail + 1)); }

# Runs a curl call, prints the response, and dies with a clear message on
# non-2xx so failures point at the exact step instead of a generic curl error.
call() {
  local method="$1" path="$2" body="${3:-}"
  local args=(-sS -w '\n%{http_code}' -X "$method" "$BASE$path" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
  [[ -n "$body" ]] && args+=(-d "$body")

  local raw status response
  raw="$(curl "${args[@]}")"
  status="${raw##*$'\n'}"
  response="${raw%$'\n'*}"

  echo "  $method $path -> $status" >&2
  if [[ ! "$status" =~ ^2 ]]; then
    echo "  Response: $response" >&2
    bad "$method $path returned $status" >&2
    echo >&2
    echo "Smoke test aborted early. $pass passed, $fail failed." >&2
    exit 1
  fi
  echo "$response"
}

db_exec() {
  encore db shell "$DB_NAME" --env="$DB_ENV" <<SQL
$1
SQL
}

step "Seed region and entity"
db_exec "
INSERT INTO regions (code, name, region_type, created_by)
  VALUES ('${REGION_CODE}', 'Smoke Test Region', 'COUNTRY', 'smoke-test');
INSERT INTO entities (name, type, is_active)
  VALUES ('Smoke Test Facility', 1, true);
"
REGION_ID="$(db_exec "SELECT id FROM regions WHERE code = '${REGION_CODE}';" | sed -n '3p' | tr -d ' ')"
ENTITY_ID="$(db_exec "SELECT id FROM entities WHERE name = 'Smoke Test Facility' ORDER BY id DESC LIMIT 1;" | sed -n '3p' | tr -d ' ')"
[[ -n "$REGION_ID" && -n "$ENTITY_ID" ]] && ok "seeded region=$REGION_ID entity=$ENTITY_ID" || { bad "failed to seed region/entity"; exit 1; }

step "Create waste hierarchy: type / group / characteristics"
# waste_hierarchy.name has a uniqueness constraint (violations surface as an
# uncaught 500, not 400/409) — suffix with RUN_ID so reruns never collide.
TYPE_ID=$(call POST /api/v1/waste-hierarchy \
  "{\"regionId\":$REGION_ID,\"name\":\"Infectious Waste ${RUN_ID}\",\"nameEn\":\"Infectious Waste ${RUN_ID}\",\"description\":\"Infectious waste type\",\"level\":0,\"isResidue\":false,\"isActive\":true}" \
  | jq -r '.data.id')
GROUP_ID=$(call POST /api/v1/waste-hierarchy \
  "{\"regionId\":$REGION_ID,\"name\":\"Sharps ${RUN_ID}\",\"nameEn\":\"Sharps ${RUN_ID}\",\"description\":\"Sharps waste group\",\"level\":1,\"isResidue\":false,\"isActive\":true}" \
  | jq -r '.data.id')
CHAR_ID=$(call POST /api/v1/waste-hierarchy \
  "{\"regionId\":$REGION_ID,\"name\":\"High Risk ${RUN_ID}\",\"nameEn\":\"High Risk ${RUN_ID}\",\"description\":\"High risk characteristics\",\"level\":2,\"isResidue\":false,\"isActive\":true}" \
  | jq -r '.data.id')
[[ "$TYPE_ID" != "null" && "$GROUP_ID" != "null" && "$CHAR_ID" != "null" ]] \
  && ok "hierarchy ids: type=$TYPE_ID group=$GROUP_ID characteristics=$CHAR_ID" \
  || { bad "one or more waste-hierarchy creates failed"; exit 1; }

step "Create waste classification"
CLASS_ID=$(call POST /api/v1/waste-classification "{
  \"regionId\": $REGION_ID,
  \"effectiveFrom\": \"2026-01-01\",
  \"effectiveTo\": \"2030-01-01\",
  \"wasteTypeId\": $TYPE_ID, \"wasteGroupId\": $GROUP_ID, \"wasteCharacteristicsId\": $CHAR_ID,
  \"wasteCode\": \"INF-${RUN_ID}\",
  \"wasteBagColorCode\": \"YELLOW\",
  \"useColdStorage\": false,
  \"allowHealthcareFacilityTreatment\": true,
  \"hasMultipleTransporters\": false,
  \"disposalMethod\": \"INCINERATION\",
  \"isActive\": true
}" | jq -r '.data.id')
[[ "$CLASS_ID" != "null" ]] && ok "classification id=$CLASS_ID" || { bad "waste-classification create failed"; exit 1; }

step "Create waste source"
SOURCE_ID=$(call POST /api/v1/waste-source \
  "{\"healthcareFacilityId\":$ENTITY_ID,\"sourceType\":\"INTERNAL\",\"internalSourceName\":\"Ward 3\",\"isActive\":true,\"isResidue\":false}" \
  | jq -r '.data.id')
[[ "$SOURCE_ID" != "null" ]] && ok "waste source id=$SOURCE_ID" || { bad "waste-source create failed"; exit 1; }

step "Create waste bag"
BAG_RESPONSE=$(call POST /api/v1/waste "{
  \"healthcareFacilityId\": $ENTITY_ID,
  \"wasteSourceId\": $SOURCE_ID,
  \"wasteClassificationId\": $CLASS_ID,
  \"scaleMethod\": \"MANUAL\",
  \"wasteBagQrCodeId\": \"$QR_CODE\",
  \"weightInKgs\": 4.2
}")
BAG_STATUS=$(echo "$BAG_RESPONSE" | jq -r '.data.wasteStatus')
[[ "$BAG_STATUS" == "IN_TEMPORARY_STORAGE" ]] \
  && ok "waste bag created, status=$BAG_STATUS" \
  || { bad "expected IN_TEMPORARY_STORAGE, got $BAG_STATUS"; exit 1; }

step "Move to cold storage"
call PATCH /api/v1/waste/cold-store "{\"wasteBagQrCodeIds\":[\"$QR_CODE\"]}" > /dev/null
ok "cold-store transition accepted"

step "Flag for internal treatment (landfill)"
call PATCH /api/v1/waste/internal_landfill "{
  \"wasteBagQrCodeIds\": [\"$QR_CODE\"],
  \"treatmentStartTime\": \"2026-08-11T03:15:00Z\",
  \"treatmentEndTime\": \"2026-08-11T03:20:00Z\"
}" > /dev/null
ok "internal_landfill transition accepted"

step "Verify final status and audit trail"
FINAL_STATUS="$(db_exec "SELECT waste_status FROM waste_bag WHERE waste_bag_qr_code_id = '${QR_CODE}';" | sed -n '3p' | tr -d ' ')"
[[ "$FINAL_STATUS" == "INTERNAL_LANDFILLED" ]] \
  && ok "final waste_status = $FINAL_STATUS" \
  || bad "expected INTERNAL_LANDFILLED, got '$FINAL_STATUS'"

AUDIT_COUNT="$(db_exec "SELECT count(*) FROM waste_bag_audit_trail wbat JOIN waste_bag wb ON wb.id = wbat.waste_bag_id WHERE wb.waste_bag_qr_code_id = '${QR_CODE}';" | sed -n '3p' | tr -d ' ')"
[[ "$AUDIT_COUNT" -ge 2 ]] \
  && ok "audit trail has $AUDIT_COUNT rows for this bag" \
  || bad "expected >=2 audit trail rows, got '$AUDIT_COUNT'"

echo
echo "================================"
echo "$pass passed, $fail failed"
echo "================================"
[[ "$fail" -eq 0 ]]
