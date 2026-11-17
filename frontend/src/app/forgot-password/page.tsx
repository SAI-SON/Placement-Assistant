'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getApiEndpoint = (endpoint: string) => {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${backendBase}/api${endpoint}`;
  };

  // Step 1: Request Reset Token
  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      let res;
      try {
        res = await fetch(getApiEndpoint('/auth/forgot-password'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });
      } catch {
        res = await fetch('/api/backend/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to request password reset.');
        return;
      }

      const receivedToken = data.data?.resetToken;
      setToken(receivedToken || '');
      setSuccess('Reset token generated and registered in PostgreSQL! Proceed to set your new password.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Network error requesting password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password with Token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Password reset token is required.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setIsLoading(true);
    try {
      let res;
      try {
        res = await fetch(getApiEndpoint('/auth/reset-password'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim(), newPassword }),
        });
      } catch {
        res = await fetch('/api/backend/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim(), newPassword }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset password.');
        return;
      }

      setSuccess('Password updated successfully in PostgreSQL! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Network error resetting password.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-primary/30 rounded-3xl blur-xl opacity-50" />

          <div className="relative bg-card/85 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
                <KeyRound className="size-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {step === 1 ? 'Forgot Password' : 'Reset Your Password'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {step === 1
                  ? 'Enter your registered email to generate a database reset token'
                  : 'Enter your new password to update your PostgreSQL credentials'}
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                  step === 1
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-muted/40 border-white/[0.08] text-muted-foreground'
                }`}
              >
                <span className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Request Token</span>
              </div>
              <div className="w-4 h-[1px] bg-white/[0.1]" />
              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                  step === 2
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-muted/40 border-white/[0.08] text-muted-foreground'
                }`}
              >
                <span className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Set Password</span>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 flex items-start gap-2.5 text-destructive text-xs">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-400 text-xs">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {step === 1 ? (
              /* Step 1: Email Form */
              <form onSubmit={handleRequestToken} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-foreground">
                    Registered Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. candidate@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 bg-muted/40 border-white/[0.08] focus:border-primary/60 text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full primary-glow-btn text-white font-medium rounded-xl text-xs h-10 mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin size-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Generating Database Reset Token...
                    </span>
                  ) : (
                    <>
                      <span>Generate Reset Token</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Step 2: New Password Form */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="token" className="text-xs font-medium text-foreground">
                      Reset Token
                    </Label>
                    <button
                      type="button"
                      onClick={copyToken}
                      className="text-[11px] text-primary flex items-center gap-1 hover:underline"
                    >
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <Input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="Enter reset token"
                    className="bg-muted/40 font-mono text-[11px] border-white/[0.08] focus:border-primary/60 h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-medium text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-9 pr-9 bg-muted/40 border-white/[0.08] focus:border-primary/60 text-xs h-10 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-9 bg-muted/40 border-white/[0.08] focus:border-primary/60 text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full primary-glow-btn text-white font-medium rounded-xl text-xs h-10 mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin size-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Updating Database...
                    </span>
                  ) : (
                    <>
                      <span>Save New Password</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Back to Login link */}
            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <Link href="/login" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <ArrowLeft className="size-3.5" />
                <span>Back to Sign In</span>
              </Link>
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-primary hover:underline text-[11px]"
                >
                  Request another token
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
