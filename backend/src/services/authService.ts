import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db';
import { UserRecord, PasswordResetRecord } from '../types/database';
import { UserProfile, SignupRequest, LoginRequest, UpdateProfileRequest } from '../types/api';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_placement_assistant_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function formatUserProfile(user: UserRecord): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    target_role: user.target_role || 'Full-Stack Developer',
    phone: user.phone || null,
    location: user.location || null,
    linkedin: user.linkedin || null,
    github: user.github || null,
    bio: user.bio || null,
    avatar_url: user.avatar_url,
    created_at: new Date(user.created_at).toISOString(),
  };
}

export function generateToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

export function verifyToken(token: string): { id: number; email: string; role: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
}

export async function signup(data: SignupRequest): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if user already exists
  const existing = await query<UserRecord>(
    'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [normalizedEmail]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    throw new Error('An account with this email address already exists.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // Insert user
  const result = await query<UserRecord>(
    `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, 'candidate')
    RETURNING *;
    `,
    [data.name.trim(), normalizedEmail, passwordHash]
  );

  const newUser = result.rows[0];
  const token = generateToken(newUser);
  return { user: formatUserProfile(newUser), token };
}

export async function login(data: LoginRequest): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = data.email.trim().toLowerCase();

  // Lookup user by email
  const result = await query<UserRecord>(
    'SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [normalizedEmail]
  );

  if (!result.rowCount || result.rowCount === 0) {
    throw new Error('Invalid email or password.');
  }

  const user = result.rows[0];

  // Compare password hash
  const isValid = await bcrypt.compare(data.password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const token = generateToken(user);
  return { user: formatUserProfile(user), token };
}

export async function requestPasswordReset(email: string): Promise<{ token: string; expiresAt: Date; user: UserProfile }> {
  const normalizedEmail = email.trim().toLowerCase();

  const userResult = await query<UserRecord>(
    'SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [normalizedEmail]
  );

  if (!userResult.rowCount || userResult.rowCount === 0) {
    throw new Error('No account found with this email address.');
  }

  const user = userResult.rows[0];

  // Generate a cryptographically secure random token (hex string)
  const token = crypto.randomBytes(32).toString('hex');
  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Invalidate any previous unused reset tokens for this user
  await query(
    'UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE',
    [user.id]
  );

  // Insert reset token
  await query(
    `
    INSERT INTO password_resets (user_id, token, expires_at, used)
    VALUES ($1, $2, $3, FALSE);
    `,
    [user.id, token, expiresAt]
  );

  console.log(`[AuthService] Password reset token generated for ${user.email}: ${token}`);
  return { token, expiresAt, user: formatUserProfile(user) };
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  if (!token || !newPassword) {
    throw new Error('Token and new password are required.');
  }

  // Lookup token
  const resetResult = await query<PasswordResetRecord>(
    `
    SELECT * FROM password_resets 
    WHERE token = $1 AND used = FALSE AND expires_at > CURRENT_TIMESTAMP
    LIMIT 1;
    `,
    [token]
  );

  if (!resetResult.rowCount || resetResult.rowCount === 0) {
    throw new Error('Invalid or expired password reset token.');
  }

  const resetRecord = resetResult.rows[0];

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  // Update user's password
  await query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newHash, resetRecord.user_id]
  );

  // Mark token as used
  await query(
    'UPDATE password_resets SET used = TRUE WHERE id = $1',
    [resetRecord.id]
  );

  console.log(`[AuthService] Password reset completed for user_id: ${resetRecord.user_id}`);
  return true;
}

export async function getUserById(id: number): Promise<UserProfile | null> {
  const result = await query<UserRecord>(
    'SELECT * FROM users WHERE id = $1 LIMIT 1',
    [id]
  );

  if (!result.rowCount || result.rowCount === 0) {
    return null;
  }

  return formatUserProfile(result.rows[0]);
}

export async function updateUserProfile(userId: number, data: UpdateProfileRequest): Promise<UserProfile> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIdx++}`);
    values.push(data.name.trim());
  }
  if (data.target_role !== undefined) {
    updates.push(`target_role = $${paramIdx++}`);
    values.push(data.target_role.trim());
  }
  if (data.phone !== undefined) {
    updates.push(`phone = $${paramIdx++}`);
    values.push(data.phone.trim());
  }
  if (data.location !== undefined) {
    updates.push(`location = $${paramIdx++}`);
    values.push(data.location.trim());
  }
  if (data.linkedin !== undefined) {
    updates.push(`linkedin = $${paramIdx++}`);
    values.push(data.linkedin.trim());
  }
  if (data.github !== undefined) {
    updates.push(`github = $${paramIdx++}`);
    values.push(data.github.trim());
  }
  if (data.bio !== undefined) {
    updates.push(`bio = $${paramIdx++}`);
    values.push(data.bio.trim());
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const sql = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramIdx}
    RETURNING *;
  `;

  const result = await query<UserRecord>(sql, values);
  if (!result.rowCount || result.rowCount === 0) {
    throw new Error('User account not found.');
  }

  return formatUserProfile(result.rows[0]);
}

export async function changePassword(
  userId: number,
  currentPass: string,
  newPass: string
): Promise<boolean> {
  const userResult = await query<UserRecord>(
    'SELECT * FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );

  if (!userResult.rowCount || userResult.rowCount === 0) {
    throw new Error('User account not found.');
  }

  const user = userResult.rows[0];
  const isValid = await bcrypt.compare(currentPass, user.password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect.');
  }

  if (newPass.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPass, salt);

  await query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newHash, userId]
  );

  return true;
}
