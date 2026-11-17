import { Request, Response } from 'express';
import {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
  updateUserProfile,
  changePassword,
} from '../services/authService';
import { ApiResponse, AuthResponseData, UserProfile } from '../types/api';

export async function handleSignup(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({
      success: false,
      error: 'Please provide a valid full name (minimum 2 characters).',
    });
    return;
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({
      success: false,
      error: 'Please provide a valid email address.',
    });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long.',
    });
    return;
  }

  try {
    const result = await signup({ name, email, password });
    const response: ApiResponse<AuthResponseData> = {
      success: true,
      message: 'Account created successfully! Welcome to Placement Assistant.',
      data: result,
    };
    res.status(201).json(response);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create account.',
    });
  }
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: 'Email and password are required.',
    });
    return;
  }

  try {
    const result = await login({ email, password });
    const response: ApiResponse<AuthResponseData> = {
      success: true,
      message: 'Signed in successfully!',
      data: result,
    };
    res.status(200).json(response);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed.',
    });
  }
}

export async function handleForgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({
      success: false,
      error: 'Please provide a valid email address.',
    });
    return;
  }

  try {
    const { token, expiresAt, user } = await requestPasswordReset(email);

    // In a production app, an email with a reset link is sent.
    // For direct usability and immediate testing, we return the reset token directly.
    const response: ApiResponse<{ resetToken: string; expiresAt: string; email: string }> = {
      success: true,
      message: `Password reset token generated for ${user.email}. Use this token to reset your password.`,
      data: {
        resetToken: token,
        expiresAt: expiresAt.toISOString(),
        email: user.email,
      },
    };
    res.status(200).json(response);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message || 'Failed to process password reset request.',
    });
  }
}

export async function handleResetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Password reset token is required.',
    });
    return;
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long.',
    });
    return;
  }

  try {
    await resetPassword(token, newPassword);
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    };
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to reset password.',
    });
  }
}

export async function handleGetMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized.',
    });
    return;
  }

  const response: ApiResponse<UserProfile> = {
    success: true,
    data: req.user,
  };
  res.status(200).json(response);
}

export async function handleUpdateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Please sign in.',
    });
    return;
  }

  try {
    const updatedUser = await updateUserProfile(req.user.id, req.body);
    const response: ApiResponse<UserProfile> = {
      success: true,
      message: 'Profile updated successfully!',
      data: updatedUser,
    };
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update profile.',
    });
  }
}

export async function handleChangePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Please sign in.',
    });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      success: false,
      error: 'Current password and new password are required.',
    });
    return;
  }

  try {
    await changePassword(req.user.id, currentPassword, newPassword);
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: 'Password changed successfully!',
    };
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to change password.',
    });
  }
}
