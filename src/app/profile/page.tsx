'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Store, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Edit, 
  ChevronRight, 
  CheckCircle2,
  Key,
  Wrench,
  MapPin,
  Clock,
  Phone,
  Globe,
  Mail,
  Building2,
  Camera,
  Upload,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { IndustryType } from '@/types';

// Center-crop an image file to a 512x512 square canvas
const cropToSquare = (file: File): Promise<{ blob: Blob; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, startX, startY, size, size, 0, 0, 512, 512);

        const dataUrl = canvas.toDataURL('image/webp', 0.92);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            reject(new Error('Failed to generate cropped image'));
          }
        }, 'image/webp', 0.92);
      };
      img.onerror = () => reject(new Error('Failed to load image for cropping'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export default function ProfilePage() {
  const router = useRouter();
  const { 
    profile, 
    businessProfile,
    updateProfile, 
    updateBusinessProfile,
    showToast,
    signOut,
    session,
    isDemoMode
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreviewSrc, setAvatarPreviewSrc] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB.',
        type: 'error',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate file format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showToast({
        title: 'Invalid File Format',
        description: 'Please select a JPG, PNG, or WebP image.',
        type: 'error',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      // 3. Center crop to 512x512 square
      const { blob, dataUrl } = await cropToSquare(file);
      const croppedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
        type: 'image/webp',
      });

      setAvatarPreviewSrc(dataUrl);
      setAvatarFile(croppedFile);
      setIsAvatarModalOpen(true);
    } catch (err) {
      console.error('Image crop notice:', err);
      // Fallback to uncropped file preview
      const preview = URL.createObjectURL(file);
      setAvatarPreviewSrc(preview);
      setAvatarFile(file);
      setIsAvatarModalOpen(true);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !avatarPreviewSrc) return;

    setIsUploadingAvatar(true);

    try {
      if (isDemoMode) {
        // In demo mode, apply preview immediately
        updateProfile({ avatarUrl: avatarPreviewSrc });
        setIsAvatarModalOpen(false);
        setAvatarPreviewSrc(null);
        setAvatarFile(null);
        showToast({
          title: 'Profile Picture Updated',
          description: 'Avatar updated successfully (Demo Workspace).',
          type: 'success',
        });
        return;
      }

      // Fetch current session for Bearer fallback
      let accessToken = session?.access_token;
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          accessToken = sessionData.session.access_token;
        }
      } catch {
        // Fallback
      }

      const formData = new FormData();
      formData.append('file', avatarFile);

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.avatarUrl) {
        throw new Error(data.error || `Upload failed with HTTP ${res.status}`);
      }

      // Update global context state - immediately cascades across Navbar, AppShell, Profile
      updateProfile({ avatarUrl: data.avatarUrl });
      setIsAvatarModalOpen(false);
      setAvatarPreviewSrc(null);
      setAvatarFile(null);

      showToast({
        title: 'Profile Picture Updated',
        description: 'Your new avatar is now live across your workspace.',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload profile picture.';
      showToast({
        title: 'Avatar Upload Failed',
        description: msg,
        type: 'error',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Form edit states
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [businessName, setBusinessName] = useState(businessProfile?.name || profile.businessName);
  const [phone, setPhone] = useState(businessProfile?.phone || profile.phone);
  const [website, setWebsite] = useState(businessProfile?.website || '');
  const [address, setAddress] = useState(businessProfile?.address || profile.address);
  const [industry, setIndustry] = useState<IndustryType>(businessProfile?.industry || 'HVAC');
  const [twoFactor, setTwoFactor] = useState(profile.twoFactorEnabled);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      role,
      businessName,
      phone,
      address,
      twoFactorEnabled: twoFactor
    });
    updateBusinessProfile({
      name: businessName,
      phone,
      address,
      industry,
      website
    });
    setIsEditProfileOpen(false);
  };

  const handleBusinessSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      name: businessName,
      phone,
      address,
      industry,
      website
    });
    setIsBusinessModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <AppShell title="Profile & Account">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleAvatarFileSelect}
          disabled={isUploadingAvatar}
        />

        {/* Profile Header */}
        <section className="flex flex-col items-center text-center gap-3 pt-2 pb-6 border-b border-outline-variant">
          <div className="relative group">
            <div 
              onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-highest shadow-sm relative cursor-pointer bg-surface-container-high transition-transform duration-200 group-hover:scale-105"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Change profile picture"
              title="Click to change profile picture"
            >
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
              />

              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white">
                <Camera className="w-5 h-5 mb-0.5 drop-shadow" />
                <span className="text-[10px] font-semibold tracking-wide uppercase drop-shadow">Change</span>
              </div>

              {/* Loading overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mb-1" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-primary">Uploading</span>
                </div>
              )}
            </div>

            {/* Edit / Camera Badge Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-2 border-2 border-surface flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
              title="Upload new profile picture"
              aria-label="Upload new profile picture"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">{profile.name}</h1>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
              {profile.role}, {businessProfile?.name || profile.businessName}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[16px] fill-icon">verified</span>
              <span className="text-xs font-bold text-primary">{businessProfile?.industry || 'HVAC'} Operating System</span>
            </div>
          </div>
        </section>

        {/* Business Profile Quick Card */}
        <section className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Service Business Profile</h3>
            </div>
            <Link
              href="/onboarding"
              className="text-xs font-bold text-primary hover:underline"
            >
              Rerun Setup Wizard
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-outline">Trade:</span>
              <span className="font-semibold text-on-surface ml-1">{businessProfile?.industry || 'HVAC'}</span>
            </div>
            <div>
              <span className="text-outline">Dispatch Phone:</span>
              <span className="font-semibold text-on-surface ml-1">{businessProfile?.phone || profile.phone}</span>
            </div>
            <div>
              <span className="text-outline">Service Areas:</span>
              <span className="font-semibold text-on-surface ml-1">{businessProfile?.serviceAreas?.length || 4} areas</span>
            </div>
            <div>
              <span className="text-outline">Timezone:</span>
              <span className="font-semibold text-on-surface ml-1">{businessProfile?.timezone || 'Central (US)'}</span>
            </div>
          </div>
        </section>

        {/* Settings List */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xs font-bold text-outline uppercase tracking-wider px-2 mb-1">
            Account Management
          </h2>

          <div
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-surface-container-highest p-2.5 rounded-xl text-primary">
                <span className="material-symbols-outlined text-[20px] fill-icon">storefront</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Business Information</h3>
                <p className="text-xs text-on-surface-variant">Manage company details, phone, trade, and address</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline-variant" />
          </div>

          <Link
            href="/pricing"
            className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant hover:bg-surface-container-low transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-surface-container-highest p-2.5 rounded-xl text-primary">
                <span className="material-symbols-outlined text-[20px] fill-icon">workspace_premium</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Subscription & Tier</h3>
                <p className="text-xs text-on-surface-variant">{profile.plan} • Billed {profile.billingCycle}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline-variant" />
          </Link>

          <Link
            href="/notifications"
            className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant hover:bg-surface-container-low transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-surface-container-highest p-2.5 rounded-xl text-primary">
                <span className="material-symbols-outlined text-[20px] fill-icon">notifications_active</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Notifications & Alerts</h3>
                <p className="text-xs text-on-surface-variant">Configure digest emails, dispatch alerts, and SMS</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline-variant" />
          </Link>

          <div
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-surface-container-highest p-2.5 rounded-xl text-primary">
                <span className="material-symbols-outlined text-[20px] fill-icon">shield</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Security & Authentication</h3>
                <p className="text-xs text-on-surface-variant">Password, Two-Factor (2FA), Active sessions</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline-variant" />
          </div>

          <Link
            href="/privacy"
            className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant hover:bg-surface-container-low transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-surface-container-highest p-2.5 rounded-xl text-primary">
                <span className="material-symbols-outlined text-[20px] fill-icon">policy</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Privacy & Legal Center</h3>
                <p className="text-xs text-on-surface-variant">Terms, Privacy Policy, DPA, Data Retention</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-outline-variant" />
          </Link>

          <Link
            href="/settings"
            className="flex items-center justify-between p-4 bg-error/5 rounded-2xl border border-error/20 hover:bg-error/10 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-error/10 p-2.5 rounded-xl text-error">
                <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-error">Delete Account & Data</h3>
                <p className="text-xs text-on-surface-variant">Permanent account and workspace erasure</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-error/60" />
          </Link>
        </section>

        {/* Danger Zone / Log Out */}
        <section className="pt-4 border-t border-outline-variant flex flex-col items-center">
          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full max-w-xs"
          >
            Log Out of Ventrexs Service OS
          </Button>
          <p className="mt-4 text-[11px] text-outline text-center">
            Ventrexs Service OS • Enterprise Cloud v13.0.0
          </p>
        </section>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Personal & Business Profile"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleProfileSave}>
              Save Profile
            </Button>
          </>
        }
      >
        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Avatar Change Row */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface-container-highest flex-shrink-0 relative bg-surface-container-high">
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface">Profile Picture</p>
              <p className="text-[11px] text-on-surface-variant truncate">JPG, PNG or WebP (max 5MB)</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            >
              Change
            </Button>
          </div>

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Account Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Job Role / Title"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <Input
            label="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">Trade Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as any)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="HVAC">HVAC & Air Conditioning</option>
              <option value="Roofing">Roofing & Siding</option>
              <option value="Plumbing">Plumbing & Drains</option>
              <option value="Electrical">Electrical Services</option>
              <option value="Concrete">Concrete & Masonry</option>
              <option value="General Contractor">General Contractor</option>
              <option value="Landscaping">Landscaping & Tree Care</option>
              <option value="Garage Door">Garage Door Services</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Cleaning">Commercial / Home Cleaning</option>
              <option value="Other">Other Service Business</option>
            </select>
          </div>

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Business Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </form>
      </Modal>

      {/* Security & Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Security & Two-Factor Authentication"
        footer={
          <Button variant="primary" size="md" onClick={() => {
            setIsPasswordModalOpen(false);
            showToast({ title: 'Security Settings Updated', type: 'success' });
          }}>
            Done
          </Button>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl border border-outline-variant bg-surface flex items-center justify-between">
            <div>
              <p className="font-bold text-on-surface">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-on-surface-variant">Require biometric / authenticator app code on login</p>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl border border-outline-variant bg-surface space-y-3">
            <p className="font-bold text-on-surface">Change Password</p>
            <Input type="password" placeholder="Current Password" />
            <Input type="password" placeholder="New Password (min 8 chars)" />
            <Button variant="secondary" size="sm" onClick={() => showToast({ title: 'Password Changed', type: 'success' })}>
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Avatar Preview & Crop Modal */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => {
          if (!isUploadingAvatar) {
            setIsAvatarModalOpen(false);
            setAvatarPreviewSrc(null);
            setAvatarFile(null);
          }
        }}
        title="Update Profile Picture"
        footer={
          <>
            <Button 
              variant="secondary" 
              size="md" 
              onClick={() => {
                setIsAvatarModalOpen(false);
                setAvatarPreviewSrc(null);
                setAvatarFile(null);
              }}
              disabled={isUploadingAvatar}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleUploadAvatar}
              disabled={isUploadingAvatar}
              leftIcon={isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            >
              {isUploadingAvatar ? 'Saving Avatar...' : 'Save Avatar'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-xs text-on-surface-variant text-center max-w-sm">
            Here is a preview of your new profile photo. It has been automatically center-cropped to a square and optimized for fast loading.
          </p>

          <div className="relative">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl relative bg-surface-container-high mx-auto ring-4 ring-surface">
              {avatarPreviewSrc && (
                <img 
                  src={avatarPreviewSrc} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover" 
                />
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <span className="text-xs font-semibold text-primary">Uploading...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>High-resolution WebP • 512×512 square format</span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Choose a different image
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
