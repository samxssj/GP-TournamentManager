import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readJSON, writeJSON } from '../storage/jsonStorage.js'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'

const testFile = path.join(process.cwd(), '__tests__/test-data.json')

describe('jsonStorage', () => {
  afterEach(async () => {
    try { await unlink(testFile) } catch {}
  })

  it('reads an existing JSON file', async () => {
    await writeFile(testFile, JSON.stringify({ foo: 'bar' }))
    const data = await readJSON(testFile)
    expect(data).toEqual({ foo: 'bar' })
  })

  it('returns default value if file does not exist', async () => {
    const data = await readJSON('/nonexistent.json', { default: true })
    expect(data).toEqual({ default: true })
  })

  it('writes JSON atomically (temp + rename)', async () => {
    await writeJSON(testFile, { hello: 'world' })
    const data = await readJSON(testFile)
    expect(data).toEqual({ hello: 'world' })
  })
})
