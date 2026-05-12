import { readFile, writeFile, rename, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function readJSON(filePath, defaultValue = null) {
  if (!existsSync(filePath)) return defaultValue
  const raw = await readFile(filePath, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch {
    console.error(`[jsonStorage] JSON inválido en ${filePath}, usando default`)
    return defaultValue
  }
}

export async function writeJSON(filePath, data) {
  const tmp = filePath + '.tmp'
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8')
  await rename(tmp, filePath)
}

export async function initStorage() {
  const dataDir = process.env.DATA_DIR || './data'
  await mkdir(dataDir, { recursive: true })
  const files = {
    [path.join(dataDir, 'athletes.json')]: { athletes: [] },
    [path.join(dataDir, 'tournaments.json')]: { tournaments: [] }
  }
  for (const [file, defaultData] of Object.entries(files)) {
    if (!existsSync(file)) await writeJSON(file, defaultData)
  }
}
