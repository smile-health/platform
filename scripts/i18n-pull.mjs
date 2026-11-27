#!/usr/bin/env node
// Pull the `ar` dictionary for the web app from Tolgee and write it next to
// every `en` locale file. Dictionaries stay bundled; nothing reads Tolgee at
// runtime. Run manually after translations change in Tolgee:
//
//   TOLGEE_URL=http://10.10.0.6:8088 TOLGEE_WEB_PROJECT_ID=40 \
//   TOLGEE_WEB_API_KEY=... node scripts/i18n-pull.mjs [--lang ar] [--check]
//
// Namespace rule (same as the push to Tolgee project 40):
//   packages/ui/src/<path>/locales/en.json      -> ui/<path>
//   packages/ui/src/locales/en/<file>.json      -> ui/<file>
//   apps/web/<path>/locales/en.json             -> web/<path>
//   apps/web/<path>/locales/en/<file>.json      -> web/<path>/<file>
// Keys are flattened with "." and arrays as `key[0]`, `key[1].field`.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOTS = [
  { dir: 'packages/ui/src', prefix: 'ui' },
  { dir: 'apps/web', prefix: 'web' },
]

const toPosix = (p) => p.split(path.sep).join('/')

/** Map a repo-relative `en` locale file to its Tolgee namespace and target file. */
export const namespaceFor = (relFile, lang = 'ar') => {
  const file = toPosix(relFile)
  const root = ROOTS.find((r) => file.startsWith(`${r.dir}/`))
  if (!root) return null
  const rest = file.slice(root.dir.length + 1)
  let ns
  let target
  let m
  if ((m = rest.match(/^(.*?)\/?locales\/en\.json$/))) {
    ns = m[1]
    target = file.replace(/locales\/en\.json$/, `locales/${lang}.json`)
  } else if ((m = rest.match(/^(.*?)\/?locales\/en\/([^/]+)\.json$/))) {
    ns = m[1] ? `${m[1]}/${m[2]}` : m[2]
    target = file.replace(/locales\/en\/([^/]+\.json)$/, `locales/${lang}/$1`)
  } else {
    return null
  }
  return { namespace: `${root.prefix}/${ns}`, target }
}

/** Flatten a nested dictionary into `a.b`, `list[0]`, `list[1].field` keys. */
export const flatten = (value, prefix = '', out = {}) => {
  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value))
      flatten(v, prefix ? `${prefix}.${k}` : k, out)
  } else {
    out[prefix] = value
  }
  return out
}

/**
 * Rebuild a dictionary with the exact shape of `template` (the `en` file),
 * taking strings from `translations` (flat key -> text). Keys Tolgee does not
 * have keep the value already in the target file (`existing`, flat), else the
 * template value; both cases are reported as missing.
 */
export const fillTemplate = (template, translations, prefix = '', missing = [], existing = {}) => {
  if (Array.isArray(template))
    return template.map((v, i) =>
      fillTemplate(v, translations, `${prefix}[${i}]`, missing, existing)
    )
  if (template && typeof template === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(template))
      out[k] = fillTemplate(v, translations, prefix ? `${prefix}.${k}` : k, missing, existing)
    return out
  }
  if (typeof template !== 'string') return template
  const text = translations[prefix]
  if (typeof text === 'string' && text.length > 0) return text
  missing.push(prefix)
  const kept = existing[prefix]
  return typeof kept === 'string' && kept.length > 0 ? kept : template
}

export const findEnFiles = (repoRoot) => {
  const found = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.json')) {
        const rel = toPosix(path.relative(repoRoot, full))
        if (/\/locales\/en(\.json|\/[^/]+\.json)$/.test(rel)) found.push(rel)
      }
    }
  }
  for (const r of ROOTS) {
    const abs = path.join(repoRoot, r.dir)
    if (fs.existsSync(abs)) walk(abs)
  }
  return found.sort()
}

/** Fetch all translations of one language, grouped by namespace. */
export const fetchTranslations = async ({ url, projectId, apiKey, lang, fetchImpl = fetch }) => {
  const byNs = {}
  let cursor
  for (let page = 0; page < 1000; page++) {
    const qs = new URLSearchParams({ languages: lang, size: '1000', sort: 'keyId' })
    if (cursor) qs.set('cursor', cursor)
    const res = await fetchImpl(`${url.replace(/\/$/, '')}/v2/projects/${projectId}/translations?${qs}`, {
      headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Tolgee responded ${res.status}`)
    const body = await res.json()
    const keys = body?._embedded?.keys ?? []
    for (const k of keys) {
      const text = k.translations?.[lang]?.text
      if (text == null) continue
      const ns = k.keyNamespace ?? ''
      ;(byNs[ns] ??= {})[k.keyName] = text
    }
    if (!body.nextCursor || keys.length === 0) break
    cursor = body.nextCursor
  }
  return byNs
}

const main = async () => {
  const args = process.argv.slice(2)
  const lang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'ar'
  const check = args.includes('--check')
  const { TOLGEE_URL, TOLGEE_WEB_PROJECT_ID, TOLGEE_WEB_API_KEY } = process.env
  if (!TOLGEE_URL || !TOLGEE_WEB_PROJECT_ID || !TOLGEE_WEB_API_KEY) {
    console.error('Set TOLGEE_URL, TOLGEE_WEB_PROJECT_ID and TOLGEE_WEB_API_KEY')
    process.exit(2)
  }
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const byNs = await fetchTranslations({
    url: TOLGEE_URL,
    projectId: TOLGEE_WEB_PROJECT_ID,
    apiKey: TOLGEE_WEB_API_KEY,
    lang,
  })
  let written = 0
  let changed = 0
  let missingTotal = 0
  for (const rel of findEnFiles(repoRoot)) {
    const mapped = namespaceFor(rel, lang)
    if (!mapped) continue
    const template = JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'))
    const targetAbs = path.join(repoRoot, mapped.target)
    const prev = fs.existsSync(targetAbs) ? fs.readFileSync(targetAbs, 'utf8') : null
    const existing = prev ? flatten(JSON.parse(prev)) : {}
    const missing = []
    const result = fillTemplate(template, byNs[mapped.namespace] ?? {}, '', missing, existing)
    if (missing.length) {
      missingTotal += missing.length
      console.warn(`${mapped.namespace}: ${missing.length} key tidak ada di Tolgee: ${missing.join(', ')}`)
    }
    const next = `${JSON.stringify(result, null, 2)}\n`
    if (prev !== next) {
      changed++
      if (!check) {
        fs.mkdirSync(path.dirname(targetAbs), { recursive: true })
        fs.writeFileSync(targetAbs, next)
      }
    }
    written++
  }
  console.log(`${written} file ${lang}, ${changed} berubah, ${missingTotal} key tidak ada di Tolgee${check ? ' (check only)' : ''}`)
  if (check && changed) process.exit(1)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
