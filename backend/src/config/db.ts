import dotenv from 'dotenv';
dotenv.config();

import sql from 'mssql/msnodesqlv8';

const primaryServer = process.env.DB_SERVER;
const targetDb      = process.env.DB_DATABASE ?? 'FastBitesDB';
const driver        = process.env.DB_ODBC_DRIVER ?? 'ODBC Driver 17 for SQL Server';
const trust         = process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' ? 'Yes' : 'No';

if (!primaryServer) throw new Error('DB_SERVER no está definido en .env');

const FALLBACK_SERVERS = [
  primaryServer,
  '.\\SQLEXPRESS',
  'localhost\\SQLEXPRESS',
];

function buildConfig(server: string, database: string) {
  return {
    server,
    database,
    connectionString:
      `Driver={${driver}};Server=${server};Database=${database};` +
      `Trusted_Connection=Yes;TrustServerCertificate=${trust};`,
    options: {
      trustServerCertificate: true,
      encrypt: false,
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
    console.log(`[DB DIAG] Conectando a master en ${primaryServer}...`);
    masterPool = await sql.connect(buildConfig(primaryServer!, 'master'));
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
      targetPool = await sql.connect(buildConfig(primaryServer!, targetDb));
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
