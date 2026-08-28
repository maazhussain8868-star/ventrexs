'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AgencyLayout } from '@/components/agency/AgencyLayout';
import { AgencyNavTab } from '@/components/agency/AgencySidebar';
import { AgencyOverview } from '@/components/agency/AgencyOverview';
import { AgencyClients } from '@/components/agency/AgencyClients';
import { AgencyOnboarding } from '@/components/agency/AgencyOnboarding';
import { AgencyDeployments } from '@/components/agency/AgencyDeployments';
import { AgencyWhiteLabel } from '@/components/agency/AgencyWhiteLabel';
import { AgencyDomains } from '@/components/agency/AgencyDomains';
import { AgencyRevenue } from '@/components/agency/AgencyRevenue';
import { AgencySubscriptions } from '@/components/agency/AgencySubscriptions';
import { AgencyHealth } from '@/components/agency/AgencyHealth';
import { AgencyActivity } from '@/components/agency/AgencyActivity';
import { AgencySettings } from '@/components/agency/AgencySettings';
import { ManageClientModal } from '@/components/agency/modals/ManageClientModal';
import { AddClientModal } from '@/components/agency/modals/AddClientModal';
import { useApp } from '@/context/AppContext';
import {
  AgencyClient,
  AgencyDeployment,
  AgencyDomainItem,
  AgencyActivityEvent,
  initialAgencyClients,
  initialAgencyDeployments,
  initialAgencyDomains,
  initialAgencyActivities,
} from '@/data/agencyData';

export default function AgencyDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useApp();

  const tabParam = searchParams.get('tab') as AgencyNavTab | null;
  const [activeTab, setActiveTab] = useState<AgencyNavTab>(tabParam || 'overview');

  // Agency data state
  const [clients, setClients] = useState<AgencyClient[]>(initialAgencyClients);
  const [deployments, setDeployments] = useState<AgencyDeployment[]>(initialAgencyDeployments);
  const [domains, setDomains] = useState<AgencyDomainItem[]>(initialAgencyDomains);
  const [activities, setActivities] = useState<AgencyActivityEvent[]>(initialAgencyActivities);

  // Modals state
  const [selectedClientForManage, setSelectedClientForManage] = useState<AgencyClient | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleSelectTab = (tab: AgencyNavTab) => {
    setActiveTab(tab);
    router.replace(`/agency?tab=${tab}`, { scroll: false });
  };

  const handleAddClient = (newClientData: Partial<AgencyClient>) => {
    const id = `cl_${Date.now()}`;
    const fullClient: AgencyClient = {
      id,
      businessId: `biz_${Date.now().toString().slice(-4)}`,
      name: newClientData.name || 'New Client Business',
      slug: newClientData.slug || 'new-client',
      initials: newClientData.initials || 'NC',
      accentColor: newClientData.accentColor || '#0284c7',
      industry: newClientData.industry || 'General Contracting',
      plan: newClientData.plan || 'Professional',
      status: newClientData.status || 'Provisioning',
      mrr: newClientData.mrr || 149,
      seats: newClientData.seats || 6,
      onboardingStage: newClientData.onboardingStage || 'Setup',
      onboardingProgress: newClientData.onboardingProgress || 20,
      domain: newClientData.domain || `portal.newclient.com`,
      domainStatus: newClientData.domainStatus || 'Action Required',
      sslActive: false,
      health: 'Healthy',
      healthScore: 92,
      lastActivity: 'Client tenant provisioned. Welcome email sent.',
      lastActivityTime: 'Just now',
      ownerName: newClientData.ownerName || 'Owner',
      ownerEmail: newClientData.ownerEmail || 'owner@newclient.com',
      phone: newClientData.phone || '+1 (555) 000-0000',
      createdAt: new Date().toISOString().split('T')[0],
      environment: newClientData.environment || 'Production US-East',
      aiUsageCalls: 0,
      monthlyInvoices: 0,
      jobsCompleted: 0,
      storageUsedMb: 10,
    };

    setClients([fullClient, ...clients]);

    // Add activity event
    const newAct: AgencyActivityEvent = {
      id: `act_${Date.now()}`,
      title: 'New Client Provisioned',
      description: `${fullClient.name} provisioned on ${fullClient.plan} plan ($${fullClient.mrr}/mo).`,
      category: 'Onboarding',
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      clientName: fullClient.name,
      clientId: fullClient.id,
      actor: 'Agency Owner',
      severity: 'success',
    };
    setActivities([newAct, ...activities]);

    showToast({
      title: 'Client Tenant Provisioned',
      description: `${fullClient.name} is now ready in the agency workspace.`,
      type: 'info',
    });
  };

  const handleUpdateClient = (updated: AgencyClient) => {
    setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
    showToast({
      title: 'Client Updated',
      description: `Settings saved for ${updated.name}.`,
      type: 'info',
    });
  };

  const handleUpdateClientStage = (clientId: string, nextStage: AgencyClient['onboardingStage']) => {
    const progressMap: Record<AgencyClient['onboardingStage'], number> = {
      'New Client': 15,
      Setup: 35,
      Branding: 55,
      Domain: 75,
      Configuration: 90,
      Live: 100,
    };

    setClients(
      clients.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            onboardingStage: nextStage,
            onboardingProgress: progressMap[nextStage] || 100,
            status: nextStage === 'Live' ? 'Active' : c.status,
            lastActivity: `Advanced to ${nextStage} stage`,
            lastActivityTime: 'Just now',
          };
        }
        return c;
      })
    );

    showToast({
      title: 'Pipeline Stage Updated',
      description: `Client progressed to "${nextStage}".`,
      type: 'info',
    });
  };

  const handleAddDomain = (domainName: string, clientName: string) => {
    const newDom: AgencyDomainItem = {
      id: `dom_${Date.now()}`,
      clientName,
      clientId: `cl_${Date.now()}`,
      domain: domainName,
      status: 'Pending DNS',
      sslStatus: 'Provisioning',
      dnsProvider: 'External DNS',
      cnameTarget: 'cname.ventrexs.com',
      txtRecord: `ventrexs-verify=${Math.random().toString(36).substring(2, 15)}`,
      aRecord: '76.76.21.21',
      lastChecked: 'Just now',
      autoRenew: true,
      sslExpires: 'Pending Verification',
    };
    setDomains([newDom, ...domains]);
  };

  const handleVerifyDomain = (domainId: string) => {
    setDomains(
      domains.map((d) => {
        if (d.id === domainId) {
          return {
            ...d,
            status: 'Connected',
            sslStatus: 'Active (TLS 1.3)',
            lastChecked: 'Just now',
            sslExpires: '2026-11-28',
          };
        }
        return d;
      })
    );
  };

  const handleTriggerRedeploy = (depId: string) => {
    if (depId === 'all') {
      setDeployments(
        deployments.map((d) => ({
          ...d,
          status: 'Live',
          lastDeployment: 'Just now',
          version: 'v13.4.2-rel',
        }))
      );
      showToast({
        title: 'Cluster Redeployed',
        description: 'All 8 edge nodes operating on v13.4.2-rel.',
        type: 'info',
      });
    } else {
      setDeployments(
        deployments.map((d) => (d.id === depId ? { ...d, status: 'Live', lastDeployment: 'Just now' } : d))
      );
      showToast({
        title: 'Deployment Successful',
        description: 'Instance rolled out to edge CDN.',
        type: 'info',
      });
    }
  };

  return (
    <AgencyLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      clients={clients}
      domains={domains}
      deployments={deployments}
      onAddClient={handleAddClient}
      onSelectClient={(client) => setSelectedClientForManage(client)}
    >
      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <AgencyOverview
          clients={clients}
          deployments={deployments}
          domains={domains}
          activities={activities}
          onSelectTab={handleSelectTab}
          onOpenAddClient={() => setIsAddClientModalOpen(true)}
          onManageClient={(c) => setSelectedClientForManage(c)}
        />
      )}

      {/* 2. Clients */}
      {activeTab === 'clients' && (
        <AgencyClients
          clients={clients}
          onOpenAddClient={() => setIsAddClientModalOpen(true)}
          onManageClient={(c) => setSelectedClientForManage(c)}
        />
      )}

      {/* 3. Onboarding */}
      {activeTab === 'onboarding' && (
        <AgencyOnboarding
          clients={clients}
          onOpenAddClient={() => setIsAddClientModalOpen(true)}
          onManageClient={(c) => setSelectedClientForManage(c)}
          onUpdateClientStage={handleUpdateClientStage}
        />
      )}

      {/* 4. Deployments */}
      {activeTab === 'deployments' && (
        <AgencyDeployments
          deployments={deployments}
          onTriggerRedeploy={handleTriggerRedeploy}
        />
      )}

      {/* 5. White-Label */}
      {activeTab === 'whitelabel' && <AgencyWhiteLabel clients={clients} />}

      {/* 6. Domains */}
      {activeTab === 'domains' && (
        <AgencyDomains
          domains={domains}
          onAddDomain={handleAddDomain}
          onVerifyDomain={handleVerifyDomain}
        />
      )}

      {/* 7. Subscriptions */}
      {activeTab === 'subscriptions' && (
        <AgencySubscriptions
          clients={clients}
          onManageClient={(c) => setSelectedClientForManage(c)}
        />
      )}

      {/* 8. Revenue */}
      {activeTab === 'revenue' && <AgencyRevenue clients={clients} />}

      {/* 9. Usage & Health */}
      {activeTab === 'health' && (
        <AgencyHealth
          clients={clients}
          onManageClient={(c) => setSelectedClientForManage(c)}
        />
      )}

      {/* 10. Activity */}
      {activeTab === 'activity' && <AgencyActivity activities={activities} />}

      {/* 11. Settings */}
      {activeTab === 'settings' && <AgencySettings />}

      {/* Manage Client Modal */}
      <ManageClientModal
        client={selectedClientForManage}
        isOpen={Boolean(selectedClientForManage)}
        onClose={() => setSelectedClientForManage(null)}
        onUpdateClient={handleUpdateClient}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onAddClient={handleAddClient}
      />
    </AgencyLayout>
  );
}
