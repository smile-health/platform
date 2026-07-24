#!/bin/bash

##############################################################################
# OpenHIM Admin User Initialization Script
#
# This script runs after OpenHIM Core starts and creates an admin user
# using environment variables for credentials.
#
# Environment Variables (required — set in infra/.env, no defaults):
#   - OPENHIM_ADMIN_USERNAME: Username for admin user
#   - OPENHIM_ADMIN_PASSWORD: Password for admin user
#   - OPENHIM_ADMIN_EMAIL: Email for admin user
#   - OPENHIM_ROOT_PASSWORD: Root user password for API authentication during init
##############################################################################

set -e

# Configuration
OPENHIM_HOST="${OPENHIM_HOST:-openhim-api.smile-indonesia.id/core}"
OPENHIM_API_PORT="${OPENHIM_CORE_PORT}"
ADMIN_USERNAME="${OPENHIM_ADMIN_USERNAME:-admin@openhim.local}"
ADMIN_PASSWORD="${OPENHIM_ADMIN_PASSWORD:-P@ssw0rd123}"
ADMIN_EMAIL="${OPENHIM_ADMIN_EMAIL:-admin@openhim.local}"
ADMIN_FIRSTNAME="OpenHIM"
ADMIN_LASTNAME="Administrator"
# Root user credentials for API authentication
OPENHIM_ROOT_USER="${OPENHIM_ROOT_USER:-root@openhim.org}"
OPENHIM_ROOT_PASSWORD="${OPENHIM_ROOT_PASSWORD:-P@ssw0rd123}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}ℹ${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

# Catch any unexpected non-zero exit and surface the line number
trap 'log_error "Unexpected error at line $LINENO — check output above"; exit 1' ERR

##############################################################################
# Wait for OpenHIM to be healthy
##############################################################################
wait_for_openhim() {
  log_info "Waiting for OpenHIM API to be ready at https://${OPENHIM_HOST}:${OPENHIM_API_PORT}..."

  local max_attempts=60
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if curl -s -k "https://${OPENHIM_HOST}:${OPENHIM_API_PORT}/heartbeat" > /dev/null 2>&1; then
      log_success "OpenHIM API is ready!"
      sleep 2
      return 0
    fi

    attempt=$((attempt + 1))
    if [ $((attempt % 5)) -eq 0 ]; then
      log_info "Still waiting... (attempt $attempt/$max_attempts)"
    fi
    sleep 1
  done

  log_error "OpenHIM API did not become ready after $max_attempts seconds"
  return 1
}

##############################################################################
# Check if user already exists by email
##############################################################################
user_exists() {
  # Use email as identifier per OpenHIM API documentation
  local response=$(curl -s -k -w "\n%{http_code}" \
    -u "${OPENHIM_ROOT_USER}:${OPENHIM_ROOT_PASSWORD}" \
    "https://${OPENHIM_HOST}:${OPENHIM_API_PORT}/users/${ADMIN_EMAIL}")

  local http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" = "200" ]; then
    return 0  # User exists
  else
    return 1  # User does not exist
  fi
}

##############################################################################
# Create admin user via OpenHIM API
##############################################################################
create_admin_user() {
  log_info "Creating admin user: $ADMIN_USERNAME"

  # Encode credentials for basic auth
  local auth_header=$(printf '%s' "${OPENHIM_ROOT_USER}:${OPENHIM_ROOT_PASSWORD}" | base64)

  local user_payload=$(cat <<EOF
{
  "firstname": "$ADMIN_FIRSTNAME",
  "surname": "$ADMIN_LASTNAME",
  "email": "$ADMIN_EMAIL",
  "password": "$ADMIN_PASSWORD",
  "groups": ["admin"]
}
EOF
)

  local response=$(curl -s -k -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic $auth_header" \
    -d "$user_payload" \
    "https://${OPENHIM_HOST}:${OPENHIM_API_PORT}/users")

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    log_success "Admin user created successfully!"
    return 0
  else
    if echo "$body" | grep -q "already exists"; then
      log_warn "Admin user '$ADMIN_USERNAME' already exists (this is OK)"
      return 0
    else
      log_error "Failed to create admin user. HTTP Code: $http_code"
      log_error "Response: $body"
      return 1
    fi
  fi
}

##############################################################################
# Activate admin user by setting password
# (OpenHIM creates users in 'newUser' locked state - must PUT to activate)
##############################################################################
activate_admin_user() {
  log_info "Activating admin user (setting password)..."

  # Encode credentials for basic auth
  local auth_header=$(printf '%s' "${OPENHIM_ROOT_USER}:${OPENHIM_ROOT_PASSWORD}" | base64)

  local activate_payload=$(cat <<EOF
{
  "firstname": "$ADMIN_FIRSTNAME",
  "surname": "$ADMIN_LASTNAME",
  "email": "$ADMIN_EMAIL",
  "password": "$ADMIN_PASSWORD",
  "groups": ["admin"]
}
EOF
)

  local response=$(curl -s -k -w "\n%{http_code}" \
    -X PUT \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic $auth_header" \
    -d "$activate_payload" \
    "https://${OPENHIM_HOST}:${OPENHIM_API_PORT}/users/${ADMIN_EMAIL}")

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    log_success "Admin user activated successfully!"
    return 0
  else
    log_error "Failed to activate admin user. HTTP Code: $http_code"
    log_error "Response: $body"
    return 1
  fi
}

##############################################################################
# Ensure the SHA-512 'token' passport exists for the admin user.
# Required for openhim-mediator-utils API authentication (mediator registration).
# OpenHIM only creates the 'local' (bcrypt) passport when users are created via
# the REST API — the 'token' passport must be created separately.
##############################################################################
ensure_token_passport() {
  log_info "Ensuring token passport exists for $ADMIN_EMAIL..."
  if node /app/init-scripts/create-token-passport.js; then
    log_success "Token passport ready for $ADMIN_EMAIL"
  else
    log_warn "Failed to create token passport — mediator registration may fail for $ADMIN_EMAIL"
  fi
}

##############################################################################
# Main execution
##############################################################################
main() {
  echo ""
  echo "=========================================="
  echo "OpenHIM Admin User Initialization"
  echo "=========================================="
  echo ""

  # Wait for OpenHIM to be ready
  if ! wait_for_openhim; then
    log_error "OpenHIM is not ready. Exiting."
    exit 1
  fi

  # Check if admin user already exists
  if user_exists; then
    log_success "Admin user '$ADMIN_USERNAME' already exists"
    ensure_token_passport
    echo ""
    echo "=========================================="
    echo "Initialization Complete ✓"
    echo "=========================================="
    echo ""
    echo "Login credentials:"
    echo "  Username: $ADMIN_USERNAME"
    echo "  Password: [as configured in environment]"
    echo ""
    exit 0
  fi

  # Create admin user
  if create_admin_user; then
    # Activate the user by setting password (clears newUser token and locked status)
    if activate_admin_user; then
      ensure_token_passport
      echo ""
      echo "=========================================="
      echo "Initialization Complete ✓"
      echo "=========================================="
      echo ""
      echo "Admin user created and activated successfully!"
      echo "Login credentials:"
      echo "  Email: $ADMIN_EMAIL"
      echo "  Password: [as configured in environment]"
      echo ""
      exit 0
    else
      echo ""
      log_error "Admin user activation failed!"
      exit 1
    fi
  else
    echo ""
    log_error "Admin user initialization failed!"
    exit 1
  fi
}

# Run main function
main
