import dotenv from 'dotenv';
import path   from 'path';

// Carga .env desde el directorio de trabajo (backend/) — no depende de __dirname
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

import sql from 'mssql';

const primaryServer = process.env.DB_SERVER;
const targetDb      = process.env.DB_DATABASE ?? 'FastBitesDB';
const driver        = process.env.DB_ODBC_DRIVER ?? 'ODBC Driver 17 for SQL Server';
const dbPort        = process.env.DB_PORT ? Number(process.env.DB_PORT) : null;
const dbUser        = process.env.DB_USER   ?? '';
const dbPass        = process.env.DB_PASSWORD ?? '';

if (!primaryServer) throw new Error('DB_SERVER no está definido en .env');

// Si DB_PORT está definido, conecta directo por IP:puerto (sin SQL Server Browser).
// Si no, intenta por nombre de instancia con fallbacks.
const FALLBACK_SERVERS = dbPort
  ? [`127.0.0.1,${dbPort}`]
  : [primaryServer, 'localhost\\SQLEXPRES'];

function buildConfig(server: string, database: string) {
  const serverHost = server.includes(',') ? server.split(',')[0] : server;
  const portNum    = server.includes(',') ? Number(server.split(',')[1]) : undefined;

  return {
    server:            serverHost,
    ...(portNum           ? { port: portNum }                     : {}),
    ...(dbUser            ? { user: dbUser, password: dbPass }    : {}),
    database,
    connectionTimeout: 8000,
    requestTimeout:    15000,
    options: {
      trustServerCertificate: true,
      encrypt:                false,
      ...(dbUser ? {} : { trustedConnection: true }),
    },
  } as unknown as sql.config;
}

// ──────────────────────────────────────────────────────────────
// Alternativa: SQL Authentication (usuario y contraseña)
// Descomentar y usar si el servidor no usa Windows Authentication.
// ──────────────────────────────────────────────────────────────
// function buildSqlAuthConfig(server: string, database: string): sql.config {
//   return {
//     server,
//     database,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     options: { trustServerCertificate: true, encrypt: false },
//   };
// }

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;

  let lastError: Error | null = null;

  for (const server of FALLBACK_SERVERS) {
    console.log(`[DB] Intentando → Server: ${server} | DB: ${targetDb} | Driver: {${driver}}`);
    try {
      pool = await sql.connect(buildConfig(server, targetDb));
      console.log(`[DB] ✓ Conexión exitosa → ${server}/${targetDb}`);
      return pool;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[DB] ✗ Falló ${server}/${targetDb}: ${lastError.message}`);
    }
  }

  throw lastError ?? new Error('No se pudo conectar a ningún servidor');
}

// ──────────────────────────────────────────────────────────────
// getDiagnostics: conecta a master y valida acceso a targetDb
// Útil para depurar antes de que el pool principal esté listo.
// ──────────────────────────────────────────────────────────────
export interface DiagnosticsResult {
  server: string;
  driver: string;
  targetDb: string;
  systemUser: string | null;
  originalLogin: string | null;
  databaseId: number | null;
  hasAccess: number | null;
  masterConnected: boolean;
  targetDbConnected: boolean;
  error?: string;
}

export async function getDiagnostics(): Promise<DiagnosticsResult> {
  const result: DiagnosticsResult = {
    server: primaryServer!,
    driver: `{${driver}}`,
    targetDb,
    systemUser: null,
    originalLogin: null,
    databaseId: null,
    hasAccess: null,
    masterConnected: false,
    targetDbConnected: false,
  };

  // Paso 1: conectar a master y ejecutar diagnóstico
  let masterPool: sql.ConnectionPool | null = null;
  try {
    console.log(`[DB DIAG] Conectando a master en ${FALLBACK_SERVERS[0]}...`);
    masterPool = await sql.connect(buildConfig(FALLBACK_SERVERS[0], 'master'));
    result.masterConnected = true;
    console.log('[DB DIAG] ✓ Conexión a master exitosa');

    const diag = await masterPool.request().query<{
      systemUser: string;
      originalLogin: string;
      databaseId: number | null;
      hasAccess: number;
    }>(`
      SELECT
        SYSTEM_USER                    AS systemUser,
        ORIGINAL_LOGIN()               AS originalLogin,
        DB_ID('${targetDb}')           AS databaseId,
        HAS_DBACCESS('${targetDb}')    AS hasAccess
    `);

    const row = diag.recordset[0];
    result.systemUser    = row?.systemUser    ?? null;
    result.originalLogin = row?.originalLogin ?? null;
    result.databaseId    = row?.databaseId    ?? null;
    result.hasAccess     = row?.hasAccess     ?? null;

    console.log(`[DB DIAG] systemUser=${result.systemUser} | hasAccess=${result.hasAccess} | dbId=${result.databaseId}`);
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    console.error(`[DB DIAG] ✗ Error en master: ${result.error}`);
    return result;
  } finally {
    await masterPool?.close().catch(() => null);
  }

  // Paso 2: si tiene acceso, intentar conectar directamente a targetDb
  if (result.hasAccess === 1) {
    let targetPool: sql.ConnectionPool | null = null;
    try {
      console.log(`[DB DIAG] Intentando conexión directa a ${targetDb}...`);
      targetPool = await sql.connect(buildConfig(FALLBACK_SERVERS[0], targetDb));
      result.targetDbConnected = true;
      console.log(`[DB DIAG] ✓ Conexión directa a ${targetDb} exitosa`);

      // Si el pool principal no está activo, aprovechamos esta conexión
      if (!pool || !pool.connected) {
        pool = targetPool;
        targetPool = null; // no cerrar, queda como pool principal
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      console.warn(`[DB DIAG] ✗ No se pudo abrir ${targetDb} directamente: ${result.error}`);
    } finally {
      await targetPool?.close().catch(() => null);
    }
  }

  return result;
}

export async function testConnection(): Promise<void> {
  const conn = await getPool();
  await conn.request().query('SELECT 1 AS ok');
}

export { sql };
