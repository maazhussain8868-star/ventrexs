import { NextRequest, NextResponse } from 'next/server';
import { processReceptionistMessage } from '@/lib/receptionist/engine';
import { validateReceptionistInput } from '@/lib/receptionist/safety';
import { buildDemoReceptionistSettings, BusinessTradeType, TRADE_PRESETS } from '@/lib/receptionist/demo-presets';
import { DemoAccessService } from '@/lib/demo-access/service';
import { ConversationState, ReceptionistConversation } from '@/types';

// In-memory rate limiting tracker fallback for serverless route
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimitKey = `demo_receptionist_${ip}`;

    // 1. Enforce Server-Side Rate Limiting
    const isAllowed = DemoAccessService.checkRateLimit(rateLimitKey, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS);
    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit reached for live demo. Please wait a moment before trying again.',
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json().catch(() => ({}));
    const {
      businessName = '',
      businessType = 'HVAC',
      businessPhone,
      conversationId = `demo-conv-${Date.now()}`,
      message = '',
      conversationState = 'NEW',
      customerName,
      customerPhone,
      customerAddress,
      serviceRequested,
    } = body;

    const trimmedMessage = String(message || '').trim();
    if (!trimmedMessage) {
      return NextResponse.json(
        { success: false, error: 'Message content is required.' },
        { status: 400 }
      );
    }

    // 3. Security & Prompt Injection / Abuse Validation
    const safetyCheck = validateReceptionistInput(trimmedMessage);
    if (!safetyCheck.isSafe) {
      return NextResponse.json({
        success: true,
        data: {
          replyText: safetyCheck.rejectionReply || "I'm the AI receptionist and can assist with service scheduling and common inquiries. How can I help you today?",
          state: conversationState,
          detectedIntent: 'GENERAL_QUESTION',
          confidence: 0.5,
          extractedInfo: {},
          suggestedSlots: [],
          handoffRequired: false,
        },
      });
    }

    // 4. Resolve Trade Preset & Settings
    const validTrade: BusinessTradeType = (TRADE_PRESETS[businessType as BusinessTradeType] ? businessType : 'HVAC') as BusinessTradeType;
    const { settings, services } = buildDemoReceptionistSettings({
      businessName,
      businessType: validTrade,
      businessPhone,
    });

    const activeConversation: Partial<ReceptionistConversation> = {
      id: conversationId,
      state: conversationState as ConversationState,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
      serviceRequested: serviceRequested || undefined,
      channel: 'VOICE',
    };

    // 5. Process through the Production AI Receptionist Engine
    const engineResponse = processReceptionistMessage({
      conversation: activeConversation,
      incomingMessage: safetyCheck.sanitizedInput,
      settings,
      services,
    });

    // 6. Generate Demo Lead ID preview if contact captured
    const hasLead = Boolean(
      engineResponse.extractedInfo.name ||
      engineResponse.extractedInfo.phone ||
      engineResponse.state === 'READY_TO_BOOK' ||
      engineResponse.requestedAction === 'CREATE_LEAD'
    );

    const generatedLeadId = hasLead ? `demo-lead-${Date.now().toString(36)}` : undefined;

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        replyText: engineResponse.replyText,
        state: engineResponse.state,
        detectedIntent: engineResponse.detectedIntent,
        confidence: engineResponse.confidence,
        extractedInfo: engineResponse.extractedInfo,
        suggestedSlots: engineResponse.suggestedSlots || [],
        requestedAction: engineResponse.requestedAction,
        handoffRequired: engineResponse.state === 'HANDOFF_REQUIRED',
        handoffReason: engineResponse.handoffReason,
        leadId: generatedLeadId,
        businessName: settings.businessDescription.split(' — ')[0],
        businessType: validTrade,
      },
    });
  } catch (error: any) {
    console.error('[API Demo Receptionist] Error processing message:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing the receptionist request.',
      },
      { status: 500 }
    );
  }
}
