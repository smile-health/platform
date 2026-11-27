import { test } from 'node:test'
import assert from 'node:assert/strict'
import { namespaceFor, flatten, fillTemplate, fetchTranslations } from './i18n-pull.mjs'

test('namespaceFor maps ui component locales', () => {
  assert.deepEqual(namespaceFor('packages/ui/src/pages/activity/locales/en.json'), {
    namespace: 'ui/pages/activity',
    target: 'packages/ui/src/pages/activity/locales/ar.json',
  })
})

test('namespaceFor maps ui shared locale folder', () => {
  assert.deepEqual(namespaceFor('packages/ui/src/locales/en/common.json'), {
    namespace: 'ui/common',
    target: 'packages/ui/src/locales/ar/common.json',
  })
})

test('namespaceFor maps web wms-module locales', () => {
  assert.deepEqual(namespaceFor('apps/web/wms-module/components/user/locales/en.json'), {
    namespace: 'web/wms-module/components/user',
    target: 'apps/web/wms-module/components/user/locales/ar.json',
  })
  assert.deepEqual(namespaceFor('apps/web/wms-module/locales/en/common.json'), {
    namespace: 'web/wms-module/common',
    target: 'apps/web/wms-module/locales/ar/common.json',
  })
})

test('namespaceFor ignores files outside the roots or non-en files', () => {
  assert.equal(namespaceFor('apps/main/locales/en.json'), null)
  assert.equal(namespaceFor('packages/ui/src/pages/activity/locales/id.json'), null)
})

test('flatten uses dots and array indexes', () => {
  assert.deepEqual(flatten({ a: { b: 'x' }, list: ['p', { f: 'q' }] }), {
    'a.b': 'x',
    'list[0]': 'p',
    'list[1].f': 'q',
  })
})

test('fillTemplate keeps the en shape and falls back for missing keys', () => {
  const missing = []
  const out = fillTemplate(
    { a: { b: 'B' }, 'dotted.key': 'D', list: ['P', { f: 'F' }], n: 3 },
    { 'a.b': 'ب', 'dotted.key': 'د', 'list[1].f': 'ف' },
    '',
    missing
  )
  assert.deepEqual(out, { a: { b: 'ب' }, 'dotted.key': 'د', list: ['P', { f: 'ف' }], n: 3 })
  assert.deepEqual(missing, ['list[0]'])
})

test('fillTemplate keeps the existing target value before falling back to en', () => {
  const missing = []
  const out = fillTemplate({ a: 'A', b: 'B' }, {}, '', missing, { a: 'أ' })
  assert.deepEqual(out, { a: 'أ', b: 'B' })
  assert.deepEqual(missing, ['a', 'b'])
})

test('fetchTranslations follows the cursor and groups by namespace', async () => {
  const pages = [
    {
      _embedded: {
        keys: [
          { keyName: 'a', keyNamespace: 'ui/common', translations: { ar: { text: 'أ' } } },
          { keyName: 'b', keyNamespace: 'ui/common', translations: {} },
        ],
      },
      nextCursor: 'c1',
    },
    { _embedded: { keys: [{ keyName: 'x', keyNamespace: 'web/x', translations: { ar: { text: 'س' } } }] } },
  ]
  const urls = []
  const fetchImpl = async (url, init) => {
    urls.push(url)
    assert.equal(init.headers['X-API-Key'], 'k')
    return { ok: true, json: async () => pages[urls.length - 1] }
  }
  const out = await fetchTranslations({ url: 'http://t/', projectId: 40, apiKey: 'k', lang: 'ar', fetchImpl })
  assert.deepEqual(out, { 'ui/common': { a: 'أ' }, 'web/x': { x: 'س' } })
  assert.match(urls[1], /cursor=c1/)
  assert.match(urls[0], /^http:\/\/t\/v2\/projects\/40\/translations\?/)
})
