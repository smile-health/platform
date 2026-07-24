import { promises as fs } from "fs"
import * as path from "path"
import inquirer from "inquirer"
import { db } from "@/common/infrastructure/database/index.js"

const SEEDS_DIR = path.join(__dirname, "views") // adjust path if needed

async function getAvailableSeeds(): Promise<string[]> {
  const files = await fs.readdir(SEEDS_DIR)
  return files.filter((f) => f.endsWith(".ts") || f.endsWith(".js")).sort() // alphabetical / numbered order
}

async function runSeed(filename: string): Promise<void> {
  const fullPath = path.join(SEEDS_DIR, filename)

  // Verify the file exists
  try {
    await fs.access(fullPath)
  } catch {
    const available = await getAvailableSeeds()
    console.error(`❌ Seed file not found: "${filename}"`)
    console.error(
      `\nAvailable seeds:\n${available.map((f) => `  - ${f}`).join("\n")}`
    )
    process.exit(1)
  }

  console.log(`🌱 Running seed: ${filename}`)

  const seed = await import(fullPath)

  if (typeof seed.seed !== "function" && typeof seed.default !== "function") {
    console.error(
      `❌ "${filename}" must export a "seed" or "default" function.`
    )
    process.exit(1)
  }

  const fn = seed.seed ?? seed.default
  await fn(db)

  console.log(`✅ Done: ${filename}`)
}

async function runAllSeeds(): Promise<void> {
  const files = await getAvailableSeeds()

  if (files.length === 0) {
    console.log("No seed files found.")
    return
  }

  console.log(`🌱 Running all ${files.length} seed(s)...\n`)

  for (const file of files) {
    await runSeed(file)
  }

  console.log("\n✅ All seeds completed.")
}

async function listSeeds(): Promise<void> {
  const files = await getAvailableSeeds()
  if (files.length === 0) {
    console.log("No seed files found.")
    return
  }
  console.log("Available seeds:")
  files.forEach((f) => console.log(`  - ${f}`))
}

// ── CLI entry point ───────────────────────────────────────────────────────────

async function main() {
  const [, , command, ...args] = process.argv

  try {
    switch (command) {
      case "run": {
        let target = args[0]
        if (!target) {
          const available = await getAvailableSeeds()
          if (available.length === 0) {
            console.log("No seed files found.")
            break
          }
          const { selected } = await inquirer.prompt([
            {
              type: "list",
              name: "selected",
              message: "Select a seed to run:",
              choices: available,
            },
          ])
          target = selected
        }
        await runSeed(target)
        break
      }

      case "run:all":
        await runAllSeeds()
        break

      case "list":
        await listSeeds()
        break

      default:
        console.log(`
Kysely Seed Runner
──────────────────
Commands:
  seed run <filename>   Run a specific seed file
  seed run:all          Run all seed files (alphabetical order)
  seed list             List all available seed files

Examples:
  ts-node seed.ts run 01_users.ts
  ts-node seed.ts run 03_products.ts
  ts-node seed.ts run:all
  ts-node seed.ts list
        `)
    }
  } finally {
    await db.destroy()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
