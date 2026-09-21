import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const DOCS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const IGNORED = new Set(['.vitepress', 'node_modules', 'public'])

/** A folder's own landing page, if it has one. Not listed as a child item. */
const FOLDER_INDEX = ['index.md', 'README.md']

/**
 * First `# ` heading of the file, ignoring anything inside a fenced code block
 * (docs/ERD.md opens with 31 mermaid fences, and `#` is a comment in several of
 * the languages we fence) and skipping YAML frontmatter. Falls back to the
 * filename, which is what docs/architecture/prd/set-material-for-so.md needs --
 * it has no H1 at all.
 */
function readTitle(absPath: string, fallback: string): string {
  const lines = fs.readFileSync(absPath, 'utf-8').split(/\r?\n/)
  let i = 0

  if (lines[0]?.trim() === '---') {
    const end = lines.indexOf('---', 1)
    if (end !== -1) {
      for (const line of lines.slice(1, end)) {
        const match = /^title:\s*(.+)$/.exec(line.trim())
        if (match) return match[1].replace(/^['"]|['"]$/g, '').trim()
      }
      i = end + 1
    }
  }

  let inFence = false
  for (; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    if (line.startsWith('# ')) {
      // Strip markdown emphasis/code markers so the sidebar stays plain text.
      return line.slice(2).replace(/[`*_]/g, '').trim()
    }
  }
  return fallback
}

/** Folder and file slugs that are acronyms, so they don't render as "Prd". */
const ACRONYMS = new Set(['api', 'erd', 'prd', 'rbac', 'sad', 'siha', 'sitb', 'sql', 'wms'])

function titleCase(slug: string): string {
  return slug
    .split(/[-_.]/)
    .filter(Boolean)
    .map((word) =>
      ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
}

/** docs-root-relative, extensionless link. VitePress appends .html at build. */
function toLink(absPath: string): string {
  return '/' + path.relative(DOCS_ROOT, absPath).split(path.sep).join('/').replace(/\.md$/, '')
}

/**
 * Mirrors the folder structure of docs/ into nested sidebar groups. Files first,
 * then sub-folders; a folder's README.md/index.md becomes that group's own link
 * rather than a child entry.
 */
function buildItems(dir: string, depth: number): DefaultTheme.SidebarItem[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: DefaultTheme.SidebarItem[] = []
  const folders: DefaultTheme.SidebarItem[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || IGNORED.has(entry.name)) continue
    const absPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const items = buildItems(absPath, depth + 1)
      // Skip folders that hold only assets (docs/architecture/erd is 9 PNGs).
      if (items.length === 0 && !folderIndex(absPath)) continue

      const index = folderIndex(absPath)
      folders.push({
        text: titleCase(entry.name),
        items,
        collapsed: depth >= 1,
        ...(index ? { link: toLink(index) } : {}),
      })
      continue
    }

    if (!entry.name.endsWith('.md')) continue
    if (FOLDER_INDEX.includes(entry.name)) continue

    files.push({ text: readTitle(absPath, titleCase(entry.name.replace(/\.md$/, ''))), link: toLink(absPath) })
  }

  files.sort((a, b) => a.text!.localeCompare(b.text!))
  folders.sort((a, b) => a.text!.localeCompare(b.text!))
  return [...files, ...folders]
}

function folderIndex(dir: string): string | undefined {
  for (const name of FOLDER_INDEX) {
    const candidate = path.join(dir, name)
    if (fs.existsSync(candidate)) return candidate
  }
  return undefined
}

/**
 * Built at config-load time by walking docs/ -- dropping a new .md file anywhere
 * under docs/ is all it takes for it to appear here. No manual registration.
 */
function sidebar(): DefaultTheme.SidebarItem[] {
  return buildItems(DOCS_ROOT, 0)
}

export default withMermaid({
  title: 'SMILE Platform Docs',
  description: 'Architecture, data model, and design documentation for the SMILE Platform.',
  lang: 'en-US',

  // Served by apps/web (Next.js) out of apps/web/public/docs -- every asset URL
  // must carry this prefix or the page loads with no CSS.
  base: '/docs/',
  outDir: '../apps/web/public/docs',
  cacheDir: './.vitepress/cache',

  // Leave cleanUrls off: VitePress then emits .html links, which Next serves
  // straight out of public/ with no per-route rewrite.
  cleanUrls: false,
  // Off deliberately: lastUpdated shells out to `git log` per page, and the
  // builder stage of apps/web/Dockerfile (node:18-alpine3.19) has no git
  // binary -- turning it on fails the image build with `spawn git ENOENT`.
  lastUpdated: false,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'ERD', link: '/ERD' },
      { text: 'Architecture', link: '/architecture/platform-overview' },
      { text: 'Archive', link: '/archive/documentation-audit-2025' },
    ],
    sidebar: sidebar(),
    search: { provider: 'local' },
    outline: [2, 3],
    docFooter: { prev: 'Previous', next: 'Next' },
    footer: {
      message: 'SMILE Platform — internal documentation',
      copyright: `© ${new Date().getFullYear()} SMILE Health`,
    },
  },
})
