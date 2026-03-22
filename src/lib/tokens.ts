import { randomBytes, createHash } from 'node:crypto'

const TOKEN_PREFIX = 'amia_'
const TOKEN_BYTES = 20 // 40 hex chars

/**
 * Genera un token con prefijo `amia_` + 40 chars hex aleatorios.
 * El prefijo permite detección por herramientas de secret scanning.
 */
export function generateToken(): string {
  return TOKEN_PREFIX + randomBytes(TOKEN_BYTES).toString('hex')
}

/**
 * Devuelve el SHA-256 hex digest del token.
 * Se almacena el hash en DB, nunca el plaintext.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Devuelve los primeros 8 caracteres del token para identificación visual.
 */
export function getTokenPrefix(token: string): string {
  return token.slice(0, 8)
}
