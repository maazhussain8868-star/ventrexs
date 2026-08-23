'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/context/AppContext';
import { 
  User, 
  Store, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Edit, 
  Camera, 
  ChevronRight, 
  CheckCircle2,
  Key
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, showToast } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form edit states
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
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
    setIsEditProfileOpen(false);
  };

  const handleLogout = () => {
    showToast({ title: 'Logged out successfully', type: 'info' });
    router.push('/login');
  };

  return (
    <AppShell title="Profile & Account">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        {/* Profile Header matching Stitch */}
        <section className="flex flex-col items-center text-center gap-3 pt-2 pb-6 border-b border-outline-variant">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-highest shadow-sm relative group">
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              className="w-full h-full object-cover" 
            />
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-1.5 border-2 border-surface flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              title="Edit Profile"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">{profile.name}</h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">{profile.role}, {profile.businessName}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-[16px] fill-icon">verified</span>
              <span className="text-xs font-bold text-primary">{profile.plan} Plan</span>
            </div>
          </div>
        </section>

        {/* Settings List matching Stitch specification */}
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
                <p className="text-xs text-on-surface-variant">Manage company details, phone and address</p>
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
                <p className="text-xs text-on-surface-variant">Configure digest emails and AR alerts</p>
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
        </section>

        {/* Danger Zone / Log Out matching Stitch */}
        <section className="pt-4 border-t border-outline-variant flex flex-col items-center">
          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full max-w-xs"
          >
            Log Out of PayPilot AI
          </Button>
          <p className="mt-4 text-[11px] text-outline text-center">
            PayPilot AI Version 2.4.0 • Enterprise Cloud
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
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
    </AppShell>
  );
}
