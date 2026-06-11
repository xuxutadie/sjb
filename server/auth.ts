import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import { getPool, isDbReady, pruneExpiredSessions, type DbSessionUser } from './db';

const SESSION_COOKIE = 'mhxx_session';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

interface AuthedRequest extends Request {
  authUser?: DbSessionUser;
}

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
}

function hashToken(token: string) {
  const secret = process.env.SESSION_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

function normalizeUsername(input: unknown) {
  return String(input || '').trim().toLowerCase();
}

function readCookie(req: Request, name: string) {
  const raw = req.headers.cookie || '';
  const cookies = raw.split(';').map((item) => item.trim()).filter(Boolean);
  for (const cookie of cookies) {
    const eqIndex = cookie.indexOf('=');
    if (eqIndex === -1) continue;
    const key = cookie.slice(0, eqIndex);
    const value = cookie.slice(eqIndex + 1);
    if (key === name) return decodeURIComponent(value);
  }
  return '';
}

function setSessionCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}${secure}`
  );
}

function clearSessionCookie(res: Response) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function requireDb(res: Response) {
  if (isDbReady()) return true;
  res.status(503).json({
    error: 'MYSQL_NOT_READY',
    message: 'MySQL 尚未连接，请先按 docs/mysql-setup.md 配置 mhxx 数据库。',
  });
  return false;
}

async function getUserFromRequest(req: Request): Promise<DbSessionUser | null> {
  if (!isDbReady()) return null;
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = hashToken(token);
  const [rows] = await getPool().query(
    `SELECT
      users.id,
      users.username,
      users.created_at,
      sessions.id AS session_id
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > NOW()
    LIMIT 1`,
    [tokenHash]
  );

  const list = rows as DbSessionUser[];
  return list[0] || null;
}

async function requireUser(req: AuthedRequest, res: Response) {
  if (!requireDb(res)) return null;
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: '请先登录后再查看后台历史数据。' });
    return null;
  }
  req.authUser = user;
  return user;
}

async function createSession(userId: number, res: Response) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await getPool().query('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
    userId,
    tokenHash,
    expiresAt,
  ]);
  setSessionCookie(res, token);
}

export function registerAuthRoutes(app: Express) {
  app.post('/api/auth/register', async (req, res) => {
    try {
      if (!requireDb(res)) return;
      const username = normalizeUsername(req.body?.username);
      const password = String(req.body?.password || '');

      if (!/^[a-z0-9_\u4e00-\u9fa5]{2,32}$/i.test(username)) {
        res.status(400).json({ error: 'BAD_USERNAME', message: '用户名需为 2-32 位中文、字母、数字或下划线。' });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: 'BAD_PASSWORD', message: '密码至少需要 6 位。' });
        return;
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const [result] = await getPool().query(
        'INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)',
        [username, passwordHash, salt]
      );

      const insertResult = result as { insertId: number };
      await createSession(insertResult.insertId, res);
      res.status(201).json({ user: { id: insertResult.insertId, username } });
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'USERNAME_EXISTS', message: '该用户名已注册，请换一个用户名。' });
        return;
      }
      console.error('Register failed:', error);
      res.status(500).json({ error: 'REGISTER_FAILED', message: '注册失败，请稍后重试。' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      if (!requireDb(res)) return;
      const username = normalizeUsername(req.body?.username);
      const password = String(req.body?.password || '');
      const [rows] = await getPool().query(
        'SELECT id, username, password_hash, password_salt FROM users WHERE username = ? LIMIT 1',
        [username]
      );
      const list = rows as Array<{ id: number; username: string; password_hash: string; password_salt: string }>;
      const user = list[0];
      if (!user || hashPassword(password, user.password_salt) !== user.password_hash) {
        res.status(401).json({ error: 'LOGIN_FAILED', message: '用户名或密码不正确。' });
        return;
      }

      await createSession(user.id, res);
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({ error: 'LOGIN_FAILED', message: '登录失败，请稍后重试。' });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!isDbReady()) {
        res.json({ user: null, dbReady: false });
        return;
      }
      await pruneExpiredSessions();
      const user = await getUserFromRequest(req);
      res.json({ user: user ? { id: user.id, username: user.username } : null, dbReady: true });
    } catch (error) {
      console.error('Read current user failed:', error);
      res.status(500).json({ error: 'ME_FAILED', message: '读取登录状态失败。' });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      if (isDbReady()) {
        const token = readCookie(req, SESSION_COOKIE);
        if (token) {
          await getPool().query('DELETE FROM sessions WHERE token_hash = ?', [hashToken(token)]);
        }
      }
      clearSessionCookie(res);
      res.json({ ok: true });
    } catch (error) {
      console.error('Logout failed:', error);
      clearSessionCookie(res);
      res.json({ ok: true });
    }
  });

  app.get('/api/predictions', async (req: AuthedRequest, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const [rows] = await getPool().query(
        'SELECT payload FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 200',
        [user.id]
      );
      const predictions = (rows as Array<{ payload: any }>).map((row) => row.payload);
      res.json({ predictions });
    } catch (error) {
      console.error('List predictions failed:', error);
      res.status(500).json({ error: 'PREDICTIONS_FAILED', message: '读取历史预测失败。' });
    }
  });

  app.post('/api/predictions', async (req: AuthedRequest, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const prediction = req.body?.prediction;
      if (!prediction?.id) {
        res.status(400).json({ error: 'BAD_PREDICTION', message: '预测记录缺少 id。' });
        return;
      }
      await getPool().query(
        `INSERT INTO predictions (user_id, prediction_uid, payload)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE payload = VALUES(payload)`,
        [user.id, String(prediction.id), JSON.stringify(prediction)]
      );
      res.status(201).json({ prediction });
    } catch (error) {
      console.error('Save prediction failed:', error);
      res.status(500).json({ error: 'SAVE_PREDICTION_FAILED', message: '保存历史预测失败。' });
    }
  });

  app.put('/api/predictions/:predictionUid', async (req: AuthedRequest, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const prediction = req.body?.prediction;
      if (!prediction?.id || String(prediction.id) !== req.params.predictionUid) {
        res.status(400).json({ error: 'BAD_PREDICTION', message: '预测记录 id 不匹配。' });
        return;
      }
      await getPool().query('UPDATE predictions SET payload = ? WHERE user_id = ? AND prediction_uid = ?', [
        JSON.stringify(prediction),
        user.id,
        req.params.predictionUid,
      ]);
      res.json({ prediction });
    } catch (error) {
      console.error('Update prediction failed:', error);
      res.status(500).json({ error: 'UPDATE_PREDICTION_FAILED', message: '更新历史预测失败。' });
    }
  });

  app.delete('/api/predictions/:predictionUid', async (req: AuthedRequest, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      await getPool().query('DELETE FROM predictions WHERE user_id = ? AND prediction_uid = ?', [
        user.id,
        req.params.predictionUid,
      ]);
      res.json({ ok: true });
    } catch (error) {
      console.error('Delete prediction failed:', error);
      res.status(500).json({ error: 'DELETE_PREDICTION_FAILED', message: '删除历史预测失败。' });
    }
  });
}
