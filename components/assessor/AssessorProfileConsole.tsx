'use client';

// ============================================================
// components/assessor/AssessorProfileConsole.tsx
// Recruiter-worthy interactive assessor profile management workspace.
// ============================================================

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SerializedUser } from '@/types';
import { updateAssessorProfileAction, changePasswordAction } from '@/app/actions/profile.actions';
import { AnalyticsChart } from '@/components/assessor/AnalyticsChart';
import { cn } from '@/lib/utils';
import {
  User, Mail, Phone, Briefcase, Calendar, Shield, Award,
  ClipboardList, Clock, ShieldCheck, ShieldAlert, CheckCircle2,
  XCircle, Copy, Check, Upload, Loader2, KeyRound, Monitor,
  Compass, BarChart3, Settings2
} from 'lucide-react';

interface Props {
  user: SerializedUser;
  profileData: {
    metrics: {
      assigned: number;
      approved: number;
      rejected: number;
      underReview: number;
      awaitingDocs: number;
      avgResolutionTime: string;
      totalReviewed: number;
      approvalRate: number;
      rejectionRate: number;
      claimsClosedThisMonth: number;
      fraudCasesDetected: number;
    };
    workload: {
      openClaims: number;
      underReview: number;
      awaitingDocs: number;
      approvedToday: number;
      rejectedToday: number;
    };
    achievements: {
      id: string;
      title: string;
      desc: string;
      icon: string;
      variant: string;
    }[];
    activities: {
      _id: string;
      action: string;
      remarks: string;
      createdAt: string;
      claimRef: string;
      claimTitle: string;
      claimId?: string;
    }[];
    chartData: any[];
  };
  browser: string;
  device: string;
}

const BADGE_ICONS: Record<string, React.ComponentType<any>> = {
  ClipboardList: ClipboardList,
  Award: Award,
  ShieldCheck: ShieldCheck,
  Clock: Clock,
  ShieldAlert: ShieldAlert,
};

export function AssessorProfileConsole({ user, profileData, browser, device }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'metrics' | 'security' | 'charts'>('profile');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Transition state for server action submissions
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingPassword, startPasswordTransition] = useTransition();

  // Local form state
  const [profileMsg, setProfileMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});

  // Avatar Upload States
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', avatarFile);

    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAvatarPreview(null);
        setAvatarFile(null);
        setProfileMsg({ success: true, text: 'Profile picture updated successfully!' });
        router.refresh();
      } else {
        setProfileMsg({ success: false, text: data.error || 'Failed to upload photo' });
      }
    } catch (err) {
      setProfileMsg({ success: false, text: 'An unexpected error occurred during upload.' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErrors({});

    const formData = new FormData(e.currentTarget);
    startProfileTransition(async () => {
      const res = await updateAssessorProfileAction(null, formData);
      if (res.success) {
        setProfileMsg({ success: true, text: res.message });
        router.refresh();
      } else {
        if (res.errors) {
          setProfileErrors(res.errors);
        } else {
          setProfileMsg({ success: false, text: res.message });
        }
      }
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordErrors({});

    const formData = new FormData(e.currentTarget);
    const formEl = e.currentTarget;
    startPasswordTransition(async () => {
      const res = await changePasswordAction(null, formData);
      if (res.success) {
        setPasswordMsg({ success: true, text: res.message });
        formEl.reset();
      } else {
        if (res.errors) {
          setPasswordErrors(res.errors);
        } else {
          setPasswordMsg({ success: false, text: res.message });
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* ── LEFT COLUMN: OVERVIEW & BADGES (4 Columns) ────────────────── */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Profile Avatar & Info Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden border-t-2 border-t-purple-500">
          
          {/* Avatar Preview/Upload Container */}
          <div className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-purple-500/20 bg-purple-500/10 mb-4 shadow-lg">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-purple-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Upload className="w-5 h-5 text-white mb-1" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Photo</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          {avatarPreview && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                {isUploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
              </button>
              <button
                onClick={() => {
                  setAvatarPreview(null);
                  setAvatarFile(null);
                }}
                disabled={isUploadingAvatar}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-base-800)] text-white rounded-lg hover:bg-[var(--color-base-700)] transition-all"
              >
                Cancel
              </button>
            </div>
          )}

          <h2 className="text-xl font-black text-white">{user.name}</h2>
          <p className="text-xs text-[var(--color-base-450)] mt-0.5 capitalize">{user.role} Console</p>
          
          <div className="mt-3.5 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[9px] uppercase tracking-widest font-black text-purple-400 bg-purple-500/10 border border-purple-500/20">
              {user.specialization || 'General'}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[9px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              Active Status
            </span>
          </div>

          <div className="w-full mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] text-left space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-base-450)] font-medium">Employee ID</span>
              <span className="font-mono font-bold text-white uppercase">{user.employeeId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-base-450)] font-medium">Experience</span>
              <span className="font-bold text-white">{user.yearsOfExperience ?? 0} Years</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-base-450)] font-medium">Member Since</span>
              <span className="text-white font-semibold">
                {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-base-450)] border-b border-[rgba(255,255,255,0.06)] pb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Contact Information
          </h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.04)]">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Email Address</span>
                <p className="text-white font-semibold truncate">{user.email}</p>
              </div>
              <button
                onClick={() => handleCopy(user.email, 'email')}
                className="p-1.5 rounded-lg hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-all"
              >
                {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex justify-between items-center p-2 rounded-xl bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.04)]">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Phone Number</span>
                <p className="text-white font-semibold truncate">{user.phone || 'N/A'}</p>
              </div>
              <button
                onClick={() => handleCopy(user.phone || '', 'phone')}
                className="p-1.5 rounded-lg hover:bg-[var(--color-base-800)] text-[var(--color-base-400)] hover:text-white transition-all"
              >
                {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Achievement Badges Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-base-450)] border-b border-[rgba(255,255,255,0.06)] pb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Performance Achievements
          </h3>
          {profileData.achievements.length === 0 ? (
            <div className="text-center py-6 text-[var(--color-base-500)] text-xs">
              Complete claim reviews to unlock performance badges.
            </div>
          ) : (
            <div className="space-y-3">
              {profileData.achievements.map((ach) => {
                const BadgeIcon = BADGE_ICONS[ach.icon] || Award;
                return (
                  <div key={ach.id} className="flex gap-3 items-center p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[var(--color-base-900)]/20 hover:bg-[var(--color-base-900)]/40 transition-colors">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                      ach.variant === 'purple' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      ach.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      ach.variant === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      ach.variant === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      ach.variant === 'rose' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-[var(--color-base-800)] text-[var(--color-base-300)]'
                    )}>
                      <BadgeIcon className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      <p className="text-[10px] text-[var(--color-base-450)] mt-0.5">{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── RIGHT COLUMN: INTERACTIVE TABS & FORMS (8 Columns) ──────────── */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex-shrink-0",
              activeTab === 'profile' 
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.05)]"
                : "text-[var(--color-base-400)] hover:text-white border border-transparent hover:bg-[var(--color-base-900)]/40"
            )}
          >
            <Settings2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex-shrink-0",
              activeTab === 'metrics' 
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.05)]"
                : "text-[var(--color-base-400)] hover:text-white border border-transparent hover:bg-[var(--color-base-900)]/40"
            )}
          >
            <Compass className="w-3.5 h-3.5" /> Specialization & Workload
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex-shrink-0",
              activeTab === 'security' 
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.05)]"
                : "text-[var(--color-base-400)] hover:text-white border border-transparent hover:bg-[var(--color-base-900)]/40"
            )}
          >
            <KeyRound className="w-3.5 h-3.5" /> Security & Access
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex-shrink-0",
              activeTab === 'charts' 
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.05)]"
                : "text-[var(--color-base-400)] hover:text-white border border-transparent hover:bg-[var(--color-base-900)]/40"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Efficiency Analytics
          </button>
        </div>

        {/* Tab 1: Profile Details & Bio */}
        {activeTab === 'profile' && (
          <div className="glass-card p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Profile Credentials</h3>
              <p className="text-xs text-[var(--color-base-450)] mt-0.5">Edit your public assessor name, phone, experience, and short bio.</p>
            </div>

            {profileMsg && (
              <div className={cn(
                "p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed",
                profileMsg.success 
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/25 text-red-400"
              )}>
                {profileMsg.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={user.name}
                    className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    required
                  />
                  {profileErrors.name && (
                    <p className="text-[10px] text-red-400 font-medium">{profileErrors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={user.phone}
                    className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    required
                  />
                  {profileErrors.phone && (
                    <p className="text-[10px] text-red-400 font-medium">{profileErrors.phone[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    defaultValue={user.yearsOfExperience ?? 0}
                    className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    min="0"
                    required
                  />
                  {profileErrors.yearsOfExperience && (
                    <p className="text-[10px] text-red-400 font-medium">{profileErrors.yearsOfExperience[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">Department Specialization (Admin Controlled)</label>
                  <input
                    type="text"
                    value={user.specialization || 'General'}
                    disabled
                    className="w-full bg-[var(--color-base-900)]/60 border border-[rgba(255,255,255,0.04)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-base-500)] select-none focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">Professional Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={user.bio || ''}
                  placeholder="Tell us about your background, certifications (e.g. Associate in Claims), and specialized knowledge areas..."
                  className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[var(--color-base-600)] focus:outline-none focus:border-purple-500/50 resize-none"
                />
                {profileErrors.bio && (
                  <p className="text-[10px] text-red-400 font-medium">{profileErrors.bio[0]}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPendingProfile}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isPendingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Specialization & Workload */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            
            {/* Specialization KPI Summary */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Specialization Status & KPIs</h3>
                <p className="text-xs text-[var(--color-base-450)] mt-0.5">Summary of claims processed within your assigned specialization: <strong className="text-purple-400">{user.specialization || 'General'}</strong></p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.04)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Claims Assigned</span>
                  <p className="text-2xl font-black text-white mt-1">{profileData.metrics.assigned}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.04)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Claims Approved</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{profileData.metrics.approved}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.04)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Claims Rejected</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">{profileData.metrics.rejected}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--color-base-900)]/40 border border-[rgba(255,255,255,0.04)] text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Resolution Time</span>
                  <p className="text-2xl font-black text-blue-400 mt-1">{profileData.metrics.avgResolutionTime}</p>
                </div>
              </div>
            </div>

            {/* Workload Summary */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Department Workload Distribution</h3>
                <p className="text-xs text-[var(--color-base-450)] mt-0.5">Real-time status tracking for claims pending investigation.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[var(--color-base-950)] text-center">
                  <span className="text-[9px] uppercase font-black text-[var(--color-base-500)] tracking-wider">Unassigned</span>
                  <p className="text-xl font-bold text-white mt-1">{profileData.workload.openClaims}</p>
                </div>
                <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[var(--color-base-950)] text-center">
                  <span className="text-[9px] uppercase font-black text-[var(--color-base-500)] tracking-wider">In Review</span>
                  <p className="text-xl font-bold text-purple-400 mt-1">{profileData.workload.underReview}</p>
                </div>
                <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[var(--color-base-950)] text-center">
                  <span className="text-[9px] uppercase font-black text-[var(--color-base-500)] tracking-wider">Awaiting Docs</span>
                  <p className="text-xl font-bold text-yellow-400 mt-1">{profileData.workload.awaitingDocs}</p>
                </div>
                <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[var(--color-base-950)] text-center">
                  <span className="text-[9px] uppercase font-black text-[var(--color-base-500)] tracking-wider">Approved Today</span>
                  <p className="text-xl font-bold text-emerald-450 mt-1 text-emerald-400">{profileData.workload.approvedToday}</p>
                </div>
                <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[var(--color-base-950)] text-center">
                  <span className="text-[9px] uppercase font-black text-[var(--color-base-500)] tracking-wider">Rejected Today</span>
                  <p className="text-xl font-bold text-rose-450 mt-1 text-rose-450 text-red-400">{profileData.workload.rejectedToday}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary Stats */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Department Audits & Quality Control</h3>
                <p className="text-xs text-[var(--color-base-450)] mt-0.5">Real metrics of performance indicators derived from claim assessments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--color-base-900)]/30 border border-[rgba(255,255,255,0.04)]">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--color-base-450)] uppercase tracking-wider">Closed This Month</span>
                    <p className="text-base font-black text-white mt-0.5">{profileData.metrics.claimsClosedThisMonth}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--color-base-900)]/30 border border-[rgba(255,255,255,0.04)]">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--color-base-450)] uppercase tracking-wider">Quality Approval Rate</span>
                    <p className="text-base font-black text-white mt-0.5">{profileData.metrics.approvalRate}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--color-base-900)]/30 border border-[rgba(255,255,255,0.04)]">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[var(--color-base-450)] uppercase tracking-wider">Fraud Cases Flagged</span>
                    <p className="text-base font-black text-white mt-0.5">{profileData.metrics.fraudCasesDetected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[rgba(255,255,255,0.06)] pb-2">Recent Activity Timeline</h3>
              {profileData.activities.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-base-500)] text-xs">
                  No activity logged recently.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[rgba(255,255,255,0.05)] pl-6">
                  {profileData.activities.map((act) => (
                    <div key={act._id} className="relative text-xs">
                      {/* Timeline dot */}
                      <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-base-950)] bg-purple-500" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div>
                          <strong className="text-white capitalize">
                            {act.action.replace('_', ' ').toLowerCase()}
                          </strong>
                          <span className="text-[var(--color-base-450)]">
                            {" "}for claim {act.claimRef} ({act.claimTitle})
                          </span>
                        </div>
                        <span className="text-[9px] text-[var(--color-base-500)] font-semibold flex-shrink-0">
                          {new Date(act.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      {act.remarks && (
                        <p className="text-[10px] text-[var(--color-base-500)] italic mt-1 leading-relaxed pl-2 border-l border-purple-500/35">
                          {act.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Security & Access */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            
            {/* Change Password Card */}
            <div className="glass-card p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Change Credentials</h3>
                <p className="text-xs text-[var(--color-base-450)] mt-0.5">Ensure security by updating your portal password regularly.</p>
              </div>

              {passwordMsg && (
                <div className={cn(
                  "p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed",
                  passwordMsg.success 
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/25 text-red-400"
                )}>
                  {passwordMsg.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    required
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-[10px] text-red-400 font-medium">{passwordErrors.currentPassword[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                      required
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-[10px] text-red-400 font-medium">{passwordErrors.newPassword[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--color-base-400)] uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="w-full bg-[var(--color-base-950)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                      required
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-[10px] text-red-400 font-medium">{passwordErrors.confirmPassword[0]}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-semibold text-[var(--color-base-500)] italic">
                    {user.passwordChangedAt 
                      ? `Last changed: ${new Date(user.passwordChangedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}`
                      : 'Password has not been changed recently.'}
                  </span>
                  <button
                    type="submit"
                    disabled={isPendingPassword}
                    className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isPendingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Active Session Info Card */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Active Session Details</h3>
                <p className="text-xs text-[var(--color-base-450)] mt-0.5">Security metadata corresponding to your active workstation connection.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-[var(--color-base-900)]/30 border border-[rgba(255,255,255,0.04)] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Device Class</span>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <span>{device}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-base-900)]/30 border border-[rgba(255,255,255,0.04)] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">User Agent Browser</span>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>{browser}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-base-900)]/30 border border-[rgba(255,255,255,0.04)] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-base-500)] tracking-wider">Last Login Timestamp</span>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Performance Analytics Charts */}
        {activeTab === 'charts' && (
          <div className="glass-card p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Auditor Productivity & Settlement Trends</h3>
              <p className="text-xs text-[var(--color-base-450)] mt-0.5">Real claims reviewed trend metrics processed under your profile.</p>
            </div>

            {profileData.metrics.totalReviewed === 0 ? (
              <div className="text-center py-20 text-[var(--color-base-500)] text-xs">
                No claim assessment records found to visualize productivity charts.
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Claims Reviewed Trend */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-base-400)]">Monthly Review Distribution</h4>
                    <span className="text-[10px] font-semibold text-[var(--color-base-500)]">Jan - Jun timeline</span>
                  </div>
                  <AnalyticsChart
                    type="bar"
                    data={profileData.chartData}
                    yKeys={[
                      { key: 'reviewed', color: 'var(--color-purple-500)', name: 'Total Reviewed' },
                      { key: 'approved', color: 'var(--color-emerald-500)', name: 'Approved Payouts' },
                      { key: 'rejected', color: 'var(--color-danger-500)', name: 'Rejected Claims' }
                    ]}
                    height={260}
                  />
                </div>

                {/* Resolution Time Indicator */}
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[var(--color-base-900)]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">Average Department Settlement Speed</h5>
                    <p className="text-[10px] text-[var(--color-base-450)]">Our SLA requires all claim reviews to be processed in under 24 hours.</p>
                  </div>
                  <div className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-black rounded-lg">
                    {profileData.metrics.avgResolutionTime} Average
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
      
    </div>
  );
}
