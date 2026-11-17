'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Rocket, User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setIsLoading(true);
    const result = await signup(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      setSuccess('Account created and saved in PostgreSQL! Launching your workspace...');
      setTimeout(() => {
        router.push('/');
      }, 700);
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-secondary/30 to-primary/30 rounded-3xl blur-xl opacity-50" />

          <div className="relative bg-card/85 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shadow-lg shadow-secondary/25 mb-3">
                <Rocket className="size-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Create Candidate Account
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Join Placement Assistant AI & accelerate your career
              </p>
            </div>

            {/* Feature Highlights Pill */}
            <div className="mb-5 p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-2.5 text-xs text-secondary">
              <ShieldCheck className="size-4 shrink-0" />
              <span className="text-[11px] leading-tight">
                Securely encrypted via bcrypt in your PostgreSQL database
              </span>
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9 bg-muted/40 border-white/[0.08] focus:border-secondary/60 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

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
                    className="pl-9 bg-muted/40 border-white/[0.08] focus:border-secondary/60 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-9 bg-muted/40 border-white/[0.08] focus:border-secondary/60 text-xs h-10 rounded-xl"
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
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 bg-muted/40 border-white/[0.08] focus:border-secondary/60 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full primary-glow-btn text-white font-medium rounded-xl text-xs h-10 mt-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin size-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Creating User in PostgreSQL...
                  </span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
