'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AttributionData, AcquisitionSource } from '@/lib/acquisition/types';

export async function recordAcquisitionAttributionAction(params: {
  userId?: string;
  businessId?: string;
  agencyId?: string;
  attribution: Partial<AttributionData>;
}) {
  try {
    const admin = createAdminClient() as any;

    const { error } = await admin.from('acquisition_attribution').insert({
      user_id: params.userId || null,
      business_id: params.businessId || null,
      agency_id: params.agencyId || null,
      acquisition_source: params.attribution.acquisition_source || 'DIRECT',
      utm_source: params.attribution.utm_source || null,
      utm_medium: params.attribution.utm_medium || null,
      utm_campaign: params.attribution.utm_campaign || null,
      utm_content: params.attribution.utm_content || null,
      utm_term: params.attribution.utm_term || null,
      landing_page: params.attribution.landing_page || '/',
      referrer: params.attribution.referrer || null,
      first_touch_at: params.attribution.first_touch_at || new Date().toISOString(),
      last_touch_at: params.attribution.last_touch_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('Acquisition attribution insert notice:', error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.warn('Error recording acquisition:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getAcquisitionOverviewAction() {
  try {
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from('acquisition_attribution')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
