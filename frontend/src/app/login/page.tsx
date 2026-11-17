'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Rocket, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess('Authenticated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 700);
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Glow behind card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-xl opacity-50" />
          
          <div className="relative bg-card/85 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 mb-3">
                <Rocket className="size-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Sign in to your Placement Assistant AI workspace
              </p>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="candidate@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-muted/40 border-white/[0.08] focus:border-primary/60 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-primary hover:underline transition-all"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full primary-glow-btn text-white font-medium rounded-xl text-xs h-10 mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin size-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Authenticating with Database...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Don't have an account yet?{' '}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
