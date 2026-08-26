import { SupabaseClient } from '@supabase/supabase-js';
import { Database, CommunicationChannel } from '../supabase/types';
import { InboundMessageEvent, InboundRoutingResult } from './types';
import { ConsentManager } from './consent-manager';
import { processReceptionistMessage } from '../receptionist/engine';

export class InboundReplyRouter {
  constructor(private client?: SupabaseClient<Database>) {}

  /**
   * Routes an inbound communication from SMS, WhatsApp, or Email
   */
  async handleInboundMessage(event: InboundMessageEvent): Promise<InboundRoutingResult> {
    const { channel, senderIdentifier, senderName, messageText, businessId, providerMessageId } = event;
    const cleanText = (messageText || '').trim();

    if (!cleanText) {
      return {
        success: false,
        handledAs: 'IGNORED',
        error: 'Empty message text',
      };
    }

    // 1. Opt-Out Detection (TCPA / CTIA Compliance)
    if (ConsentManager.isOptOutMessage(cleanText)) {
      const consentMgr = new ConsentManager(this.client);
      if (businessId) {
        // Look up customer or lead by sender phone / email
        let customerId: string | undefined;
        let leadId: string | undefined;

        if (this.client) {
          if (channel === 'email') {
            const { data: cust } = await this.client
              .from('customers')
              .select('id')
              .eq('business_id', businessId)
              .eq('email', senderIdentifier)
              .maybeSingle();
            if (cust) customerId = cust.id;
          } else {
            const { data: cust } = await this.client
              .from('customers')
              .select('id')
              .eq('business_id', businessId)
              .eq('phone', senderIdentifier)
              .maybeSingle();
            if (cust) customerId = cust.id;
          }
        }

        await consentMgr.recordOptOut({
          businessId,
          customerId,
          leadId,
          channel,
          reason: `Inbound keyword: ${cleanText.toUpperCase()}`,
        });
      }

      return {
        success: true,
        handledAs: 'OPT_OUT',
        optOutRecorded: true,
      };
    }

    // 2. Route to AI Receptionist Engine if businessId provided
    if (businessId && this.client) {
      try {
        // Check for existing conversation with this customer/channel
        const { data: existingConv } = await this.client
          .from('receptionist_conversations')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const receptionistChannel = channel === 'sms' ? 'SMS' : channel === 'whatsapp' ? 'WHATSAPP' : 'EMAIL';

        // Process message with Receptionist Engine
        const engineResult = await processReceptionistMessage({
          conversation: {
            id: existingConv?.id,
            businessId,
            channel: receptionistChannel as any,
            customerName: senderName || 'Customer',
            customerPhone: channel !== 'email' ? senderIdentifier : undefined,
            customerEmail: channel === 'email' ? senderIdentifier : undefined,
          },
          incomingMessage: cleanText,
        });

        return {
          success: true,
          handledAs: 'RECEPTIONIST_CONVERSATION',
          conversationId: existingConv?.id || 'conv-reply',
          aiReplyText: engineResult.replyText,
        };
      } catch (err: any) {
        console.warn('Receptionist routing error:', err?.message);
      }
    }

    // Fallback: CRM Activity log
    return {
      success: true,
      handledAs: 'CRM_ACTIVITY',
    };
  }
}
