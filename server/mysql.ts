import mysql from 'mysql2/promise';
import { User, Session } from './db';

// Environment variables for MySQL connection
const DB_HOST = process.env.DB_HOST || '';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || '';

let pool: mysql.Pool | null = null;
let isInitialized = false;

export function isMySQLConfigured(): boolean {
  return Boolean(DB_HOST && DB_USER && DB_NAME);
}

export function getMySQLPool(): mysql.Pool | null {
  if (!isMySQLConfigured()) {
    return null;
  }

  if (!pool) {
    try {
      pool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });
      console.log(`[MySQL] Connection pool initialized for ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    } catch (err) {
      console.error('[MySQL] Error creating pool:', err);
      pool = null;
    }
  }

  return pool;
}

export async function initializeMySQLTables(): Promise<boolean> {
  const p = getMySQLPool();
  if (!p) return false;

  if (isInitialized) return true;

  try {
    const connection = await p.getConnection();
    try {
      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          google_id VARCHAR(128) UNIQUE NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) DEFAULT '',
          avatar TEXT NULL,
          role ENUM('user', 'admin') DEFAULT 'user',
          tier ENUM('free', 'pro', 'agency') DEFAULT 'free',
          credits_used INT DEFAULT 0,
          credits_limit INT DEFAULT 10,
          creator_name VARCHAR(255) NULL,
          preferences JSON NULL,
          disabled BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_email (email),
          INDEX idx_user_google_id (google_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Create sessions table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(128) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          INDEX idx_session_user (user_id),
          INDEX idx_session_expires (expires_at),
          CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      isInitialized = true;
      console.log('[MySQL] Tables verified/initialized successfully.');
      return true;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('[MySQL] Table initialization error:', err);
    return false;
  }
}

// Convert MySQL row to User object
function rowToUser(row: any): User {
  let parsedPreferences: any = undefined;
  if (row.preferences) {
    try {
      parsedPreferences = typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences;
    } catch {
      parsedPreferences = undefined;
    }
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash || '',
    google_id: row.google_id || undefined,
    avatar: row.avatar || undefined,
    role: (row.role as 'user' | 'admin') || 'user',
    tier: (row.tier as 'free' | 'pro' | 'agency') || 'free',
    credits_used: Number(row.credits_used) || 0,
    credits_limit: Number(row.credits_limit) || 10,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    disabled: Boolean(row.disabled),
    creator_name: row.creator_name || undefined,
    preferences: parsedPreferences
  };
}

export async function findUserByGoogleIdMySQL(googleId: string): Promise<User | null> {
  const p = getMySQLPool();
  if (!p) return null;
  try {
    const [rows]: [any[], any] = await p.execute(
      'SELECT * FROM users WHERE google_id = ? LIMIT 1',
      [googleId]
    );
    if (rows.length === 0) return null;
    return rowToUser(rows[0]);
  } catch (err) {
    console.error('[MySQL] findUserByGoogleId error:', err);
    return null;
  }
}

export async function findUserByEmailMySQL(email: string): Promise<User | null> {
  const p = getMySQLPool();
  if (!p) return null;
  try {
    const [rows]: [any[], any] = await p.execute(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email.trim()]
    );
    if (rows.length === 0) return null;
    return rowToUser(rows[0]);
  } catch (err) {
    console.error('[MySQL] findUserByEmail error:', err);
    return null;
  }
}

export async function findUserByIdMySQL(userId: string): Promise<User | null> {
  const p = getMySQLPool();
  if (!p) return null;
  try {
    const [rows]: [any[], any] = await p.execute(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (rows.length === 0) return null;
    return rowToUser(rows[0]);
  } catch (err) {
    console.error('[MySQL] findUserById error:', err);
    return null;
  }
}

export async function createUserMySQL(userData: Partial<User> & { email: string; name: string }): Promise<User | null> {
  const p = getMySQLPool();
  if (!p) return null;

  const id = userData.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const email = userData.email.toLowerCase().trim();
  const name = userData.name.trim();
  const googleId = userData.google_id || null;
  const avatar = userData.avatar || null;
  const passwordHash = userData.passwordHash || '';
  const role = userData.role || (email.includes('admin') ? 'admin' : 'user');
  const tier = userData.tier || 'free';
  const creditsUsed = userData.credits_used || 0;
  const creditsLimit = userData.credits_limit || 10;
  const preferences = userData.preferences ? JSON.stringify(userData.preferences) : null;

  try {
    await p.execute(
      `INSERT INTO users 
        (id, google_id, name, email, password_hash, avatar, role, tier, credits_used, credits_limit, preferences) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, googleId, name, email, passwordHash, avatar, role, tier, creditsUsed, creditsLimit, preferences]
    );

    return findUserByIdMySQL(id);
  } catch (err) {
    console.error('[MySQL] createUser error:', err);
    return null;
  }
}

export async function updateUserMySQL(userId: string, updates: Partial<User>): Promise<User | null> {
  const p = getMySQLPool();
  if (!p) return null;

  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    values.push(updates.name);
  }
  if (updates.email !== undefined) {
    setClauses.push('email = ?');
    values.push(updates.email.toLowerCase().trim());
  }
  if (updates.google_id !== undefined) {
    setClauses.push('google_id = ?');
    values.push(updates.google_id);
  }
  if (updates.avatar !== undefined) {
    setClauses.push('avatar = ?');
    values.push(updates.avatar);
  }
  if (updates.role !== undefined) {
    setClauses.push('role = ?');
    values.push(updates.role);
  }
  if (updates.tier !== undefined) {
    setClauses.push('tier = ?');
    values.push(updates.tier);
  }
  if (updates.credits_used !== undefined) {
    setClauses.push('credits_used = ?');
    values.push(updates.credits_used);
  }
  if (updates.credits_limit !== undefined) {
    setClauses.push('credits_limit = ?');
    values.push(updates.credits_limit);
  }
  if (updates.disabled !== undefined) {
    setClauses.push('disabled = ?');
    values.push(updates.disabled ? 1 : 0);
  }
  if (updates.creator_name !== undefined) {
    setClauses.push('creator_name = ?');
    values.push(updates.creator_name);
  }
  if (updates.preferences !== undefined) {
    setClauses.push('preferences = ?');
    values.push(JSON.stringify(updates.preferences));
  }

  if (setClauses.length === 0) {
    return findUserByIdMySQL(userId);
  }

  values.push(userId);

  try {
    await p.execute(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    return findUserByIdMySQL(userId);
  } catch (err) {
    console.error('[MySQL] updateUser error:', err);
    return null;
  }
}

export async function createSessionMySQL(userId: string, durationMs = 7 * 24 * 60 * 60 * 1000): Promise<string | null> {
  const p = getMySQLPool();
  if (!p) return null;

  const token = `s_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  const expiresAt = new Date(Date.now() + durationMs).toISOString().slice(0, 19).replace('T', ' ');

  try {
    await p.execute(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [token, userId, expiresAt]
    );
    return token;
  } catch (err) {
    console.error('[MySQL] createSession error:', err);
    return null;
  }
}

export async function findSessionMySQL(token: string): Promise<Session | null> {
  const p = getMySQLPool();
  if (!p) return null;

  try {
    const [rows]: [any[], any] = await p.execute(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > NOW() LIMIT 1',
      [token]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      createdAt: new Date(row.created_at).toISOString(),
      expiresAt: new Date(row.expires_at).toISOString()
    };
  } catch (err) {
    console.error('[MySQL] findSession error:', err);
    return null;
  }
}

export async function deleteSessionMySQL(token: string): Promise<boolean> {
  const p = getMySQLPool();
  if (!p) return false;

  try {
    const [result]: any = await p.execute(
      'DELETE FROM sessions WHERE id = ?',
      [token]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error('[MySQL] deleteSession error:', err);
    return false;
  }
}
