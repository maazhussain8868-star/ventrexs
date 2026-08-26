'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
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
  Building2
} from 'lucide-react';
import { IndustryType } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { 
    profile, 
    businessProfile,
    updateProfile, 
    updateBusinessProfile,
    showToast,
    signOut
  } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
        {/* Profile Header */}
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
    </AppShell>
  );
}
