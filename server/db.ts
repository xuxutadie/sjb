import mysql from 'mysql2/promise';

export interface DbUser {
  id: number;
  username: string;
  created_at: Date;
}

export interface DbSessionUser extends DbUser {
  session_id: number;
}

let pool: mysql.Pool | null = null;
let dbReady = false;

function readDbConfig() {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'mhxx',
  };
}

export function isDbReady() {
  return dbReady;
}

export function getPool() {
  if (!pool) {
    throw new Error('MySQL is not initialized.');
  }
  return pool;
}

export async function initDatabase() {
  try {
    const dbConfig = readDbConfig();
    const bootstrap = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: false,
    });

    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await bootstrap.end();

    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
      charset: 'utf8mb4',
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL,
        password_hash VARCHAR(128) NOT NULL,
        password_salt VARCHAR(64) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY users_username_unique (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        token_hash VARCHAR(128) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY sessions_token_hash_unique (token_hash),
        KEY sessions_user_id_index (user_id),
        CONSTRAINT sessions_user_id_fk
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        prediction_uid VARCHAR(80) NOT NULL,
        payload JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY predictions_user_uid_unique (user_id, prediction_uid),
        KEY predictions_user_id_index (user_id),
        CONSTRAINT predictions_user_id_fk
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    dbReady = true;
    console.log(`MySQL database "${dbConfig.database}" is ready.`);
  } catch (error) {
    dbReady = false;
    pool = null;
    console.warn('MySQL is not available. Auth and server history APIs will return 503 until it is configured.', error);
  }
}

export async function pruneExpiredSessions() {
  if (!dbReady || !pool) return;
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
}
