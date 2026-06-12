import bcrypt from 'bcryptjs';
import axios from 'axios';
import { query } from '../db/pool';
import {
  generateTokenPair,
  verifyRefreshToken,
  hashToken,
  JWTPayload,
} from './token.service';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'internal_secret_dev';

export async function register(email: string, password: string, firstName?: string, lastName?: string) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query<{ id: string; email: string; role: string }>(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role`,
    [email, passwordHash]
  );
  const user = result.rows[0];

  try {
    await axios.post(
      `${USER_SERVICE_URL}/internal/profiles`,
      { userId: user.id, firstName, lastName },
      { headers: { 'x-internal-secret': INTERNAL_SECRET } }
    );
  } catch {
    await query('DELETE FROM users WHERE id = $1', [user.id]);
    throw new Error('Failed to create user profile');
  }

  const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokenPair(payload);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return { user: { id: user.id, email: user.email, role: user.role }, tokens };
}

export async function login(email: string, password: string) {
  const result = await query<{ id: string; email: string; password_hash: string; role: string; is_active: boolean }>(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];

  if (!user || !user.is_active) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokenPair(payload);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return { user: { id: user.id, email: user.email, role: user.role }, tokens };
}

export async function refreshTokens(refreshToken: string) {
  let payload: JWTPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  const tokenHash = hashToken(refreshToken);
  const result = await query<{ id: string; is_revoked: boolean }>(
    'SELECT id, is_revoked FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );

  if (!result.rows[0] || result.rows[0].is_revoked) {
    throw Object.assign(new Error('Refresh token invalid or expired'), { statusCode: 401 });
  }

  await query('DELETE FROM refresh_tokens WHERE id = $1', [result.rows[0].id]);

  const newPayload: JWTPayload = { userId: payload.userId, email: payload.email, role: payload.role };
  const tokens = generateTokenPair(newPayload);
  await storeRefreshToken(payload.userId, tokens.refreshToken);

  return tokens;
}

export async function logout(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await query('UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1', [tokenHash]);
}

async function storeRefreshToken(userId: string, token: string) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}
