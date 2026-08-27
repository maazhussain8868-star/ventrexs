'use client';

import React, { useState } from 'react';
import { AgencyTopBar } from './AgencyTopBar';
import { AgencySidebar, AgencyNavTab } from './AgencySidebar';
import { AddClientModal } from './modals/AddClientModal';
import { AgencySearchModal } from './modals/AgencySearchModal';
import {
  AgencyClient,
  AgencyDomainItem,
  AgencyDeployment,
} from '@/data/agencyData';
import { X } from 'lucide-react';

interface AgencyLayoutProps {
  children?: React.ReactNode;
  activeTab: AgencyNavTab;
  onSelectTab: (tab: AgencyNavTab) => void;
  clients: AgencyClient[];
  domains: AgencyDomainItem[];
  deployments: AgencyDeployment[];
  onAddClient: (newClient: Partial<AgencyClient>) => void;
  onSelectClient: (client: AgencyClient) => void;
}

export const AgencyLayout: React.FC<AgencyLayoutProps> = ({
  children,
  activeTab,
  onSelectTab,
  clients,
  domains,
  deployments,
  onAddClient,
  onSelectClient,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const totalMrr = clients.reduce((acc, c) => (c.status !== 'Suspended' ? acc + c.mrr : acc), 0);
  const atRiskCount = clients.filter((c) => c.health === 'At Risk').length;
  const pendingOnboardingCount = clients.filter((c) => c.onboardingStage !== 'Live').length;

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 flex flex-col font-sans antialiased">
      {/* Agency Dedicated Top Bar */}
      <AgencyTopBar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAddClient={() => setIsAddClientOpen(true)}
        onToggleMobileMenu={() => setMobileDrawerOpen(true)}
      />

      <div className="flex-1 flex min-w-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <AgencySidebar
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            totalClients={clients.length}
            maxClients={25}
            totalMrr={totalMrr}
            atRiskCount={atRiskCount}
            pendingOnboardingCount={pendingOnboardingCount}
          />
        </div>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          >
            <div
              className="w-72 h-full bg-white border-r border-slate-200 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="font-extrabold text-sm text-slate-900">Agency Navigation</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AgencySidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  onSelectTab(tab);
                  setMobileDrawerOpen(false);
                }}
                totalClients={clients.length}
                maxClients={25}
                totalMrr={totalMrr}
                atRiskCount={atRiskCount}
                pendingOnboardingCount={pendingOnboardingCount}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-y-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onAddClient={onAddClient}
      />

      {/* Global Command Search */}
      <AgencySearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        clients={clients}
        domains={domains}
        deployments={deployments}
        onSelectTab={onSelectTab}
        onSelectClient={onSelectClient}
        onOpenAddClient={() => setIsAddClientOpen(true)}
      />
    </div>
  );
};
