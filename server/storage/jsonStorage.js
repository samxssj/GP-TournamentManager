import { readFile, writeFile, rename } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * Lee un archivo JSON del disco.
 * Si no existe, devuelve el valor por defecto en lugar de lanzar error.
 */
export async function readJSON(filePath, defaultValue = null) {
  if (!existsSync(filePath)) return defaultValue
  const raw = await readFile(filePath, 'utf-8')
  return JSON.parse(raw)
}

/**
 * Escribe JSON de forma atómica usando el patrón write-temp + rename.
 * Evita archivos corruptos si el proceso muere durante la escritura.
 */
export async function writeJSON(filePath, data) {
  const tmp = filePath + '.tmp'
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8')
  await rename(tmp, filePath)
}

/**
 * Inicializa los archivos de persistencia al arrancar el servidor.
 * Solo crea los archivos si no existen — nunca sobreescribe datos existentes.
 */
export async function initStorage() {
  const dataDir = process.env.DATA_DIR || './data'
  const files = {
    [path.join(dataDir, 'athletes.json')]: { athletes: [] },
    [path.join(dataDir, 'tournaments.json')]: { tournaments: [] }
  }
  for (const [file, defaultData] of Object.entries(files)) {
    if (!existsSync(file)) await writeJSON(file, defaultData)
  }
}
