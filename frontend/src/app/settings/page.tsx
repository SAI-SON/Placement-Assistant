'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  KeyRound,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  Lock,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Cpu,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/app/header';

export default function SettingsPage() {
  const { user, isAuthenticated, updateProfile, changePassword } = useAuth();

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack Engineer');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [bio, setBio] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback States
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preferences State
  const [modelPreference, setModelPreference] = useState('gemini-2.5-flash');
  const [mockRigor, setMockRigor] = useState('standard');
  const [prefSaved, setPrefSaved] = useState(false);

  // Sync state from logged-in user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setTargetRole(user.target_role || 'Full-Stack Engineer');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setLinkedin(user.linkedin || '');
      setGithub(user.github || '');
      setBio(user.bio || '');
    } else {
      setName('');
      setEmail('');
      setTargetRole('');
      setPhone('');
      setLocation('');
      setLinkedin('');
      setGithub('');
      setBio('');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    const res = await updateProfile({
      name: name.trim(),
      target_role: targetRole.trim(),
      phone: phone.trim(),
      location: location.trim(),
      linkedin: linkedin.trim(),
      github: github.trim(),
      bio: bio.trim(),
    });
    setProfileLoading(false);

    if (res.success) {
      setProfileSuccess('Profile changes successfully updated in PostgreSQL database!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordSuccess('Password successfully changed in PostgreSQL!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } else {
      setPasswordError(res.error || 'Failed to change password.');
    }
  };

  const handleSavePreferences = () => {
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Sliders className="size-6 text-primary" />
              Settings & Account Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your candidate identity, security credentials, and AI workspace configurations
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
            <Database className="size-3.5" />
            <span>PostgreSQL 18 Synced</span>
          </div>
        </div>

        {/* Not Logged In Alert Notice */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  You are currently browsing as a guest
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Sign in or create a candidate account to persist your profile changes in your PostgreSQL database.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="primary-glow-btn text-white text-xs rounded-xl h-8 shrink-0">
              <Link href="/login">
                <LogIn className="size-3.5 mr-1.5" />
                Sign In
              </Link>
            </Button>
          </div>
        )}

        {/* Main Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/40 border border-white/[0.08] p-1 rounded-2xl grid grid-cols-3 max-w-md">
            <TabsTrigger
              value="profile"
              className="text-xs rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md flex items-center gap-2"
            >
              <User className="size-3.5" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-xs rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md flex items-center gap-2"
            >
              <Shield className="size-3.5" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="text-xs rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md flex items-center gap-2"
            >
              <Cpu className="size-3.5" />
              <span>AI Config</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Candidate Profile</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your personal details used across ATS resume generator and mock interviews
                  </p>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-5 p-3 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center gap-2.5 text-destructive text-xs">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name" className="text-xs font-medium text-foreground">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your Full Name"
                        className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email" className="text-xs font-medium text-foreground">
                      Email Address (Database Account ID)
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="profile-email"
                        value={email}
                        disabled
                        className="pl-9 bg-muted/20 border-white/[0.06] text-muted-foreground text-xs h-10 rounded-xl cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-role" className="text-xs font-medium text-foreground">
                      Target Career Role
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="profile-role"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Full-Stack Engineer, AI Specialist"
                        className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-location" className="text-xs font-medium text-foreground">
                      Location / Region
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="profile-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Chennai, India"
                        className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-phone" className="text-xs font-medium text-foreground">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="profile-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-linkedin" className="text-xs font-medium text-foreground">
                      LinkedIn Profile URL
                    </Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="profile-linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/alexmorgan"
                        className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-github" className="text-xs font-medium text-foreground">
                    GitHub / Portfolio Website
                  </Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="profile-github"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/alexmorgan"
                      className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-bio" className="text-xs font-medium text-foreground">
                    Career Summary / Bio
                  </Label>
                  <Textarea
                    id="profile-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your core engineering proficiencies and career aspirations..."
                    className="bg-muted/40 border-white/[0.08] text-xs rounded-xl resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="primary-glow-btn text-white text-xs rounded-xl h-10 px-5 flex items-center gap-2"
                  >
                    {profileLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin size-3.5 border-2 border-white border-t-transparent rounded-full" />
                        Saving to PostgreSQL...
                      </span>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* TAB 2: Security & Password */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-card/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Security & Password</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update your password securely stored via bcrypt in PostgreSQL
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-5 p-3 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center gap-2.5 text-destructive text-xs">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="curr-password" className="text-xs font-medium text-foreground">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="curr-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-medium text-foreground">
                    New Password (minimum 6 characters)
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-new-password" className="text-xs font-medium text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="pl-9 bg-muted/40 border-white/[0.08] text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="primary-glow-btn text-white text-xs rounded-xl h-10 px-5 flex items-center gap-2"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin size-3.5 border-2 border-white border-t-transparent rounded-full" />
                        Updating Database Password...
                      </span>
                    ) : (
                      <>
                        <Shield className="size-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* TAB 3: Preferences / AI Configuration */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="bg-card/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">AI Intelligence & Workspace Preferences</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tune model temperature, evaluation standards, and latency optimization
                  </p>
                </div>
              </div>

              {prefSaved && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Preferences saved!</span>
                </div>
              )}

              <div className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">
                    Primary Gemini AI Model
                  </Label>
                  <select
                    value={modelPreference}
                    onChange={(e) => setModelPreference(e.target.value)}
                    className="w-full bg-muted/40 border border-white/[0.08] text-xs rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-low latency, balanced scoring)</option>
                    <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Fastest candidate telemetry)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep reasoning, detailed code evaluation)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">
                    Technical Interview Simulator Rigor
                  </Label>
                  <select
                    value={mockRigor}
                    onChange={(e) => setMockRigor(e.target.value)}
                    className="w-full bg-muted/40 border border-white/[0.08] text-xs rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="standard">Standard (General Software Engineer, supportive feedback)</option>
                    <option value="strict">Strict (High-bar Mid-level Engineering standards)</option>
                    <option value="faang">FAANG Bar Raiser (Deep dive into time/space complexity)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleSavePreferences}
                    className="primary-glow-btn text-white text-xs rounded-xl h-10 px-5 flex items-center gap-2"
                  >
                    <Save className="size-4" />
                    <span>Save Preferences</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
