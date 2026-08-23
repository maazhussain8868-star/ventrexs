import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

export class AuthService {
  constructor(private client: SupabaseClient<Database>) {}

  async signUp(params: {
    email: string;
    password: string;
    name: string;
    businessName: string;
  }) {
    const { data: authData, error: authError } = await this.client.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          name: params.name,
          business_name: params.businessName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user account');

    // Create Profile
    const { error: profileError } = await this.client
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: params.name,
        email: params.email,
        role: 'owner',
      });

    if (profileError) {
      console.warn('Profile creation notice:', profileError.message);
    }

    // Create Business
    const { data: business, error: businessError } = await this.client
      .from('businesses')
      .insert({
        name: params.businessName,
        email: params.email,
        currency: 'USD ($)',
        payment_terms_days: 14,
        auto_reminder_enabled: true,
      })
      .select()
      .single();

    if (businessError) {
      console.warn('Business creation notice:', businessError.message);
    } else if (business) {
      // Add user as primary business member / owner
      await this.client.from('business_members').insert({
        business_id: business.id,
        user_id: authData.user.id,
        role: 'owner',
        is_primary: true,
      });

      // Initialize SaaS trial subscription ($19 Starter)
      await this.client.from('subscriptions').insert({
        business_id: business.id,
        plan: 'Starter',
        billing_cycle: 'monthly',
        status: 'trialing',
        price_amount: 19.00,
        currency: 'USD',
      });
    }

    return { user: authData.user, session: authData.session, business };
  }

  async signIn(params: { email: string; password: string }) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getUser() {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
