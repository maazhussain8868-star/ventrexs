'use server';

export interface BuyerInquiryPayload {
  name: string;
  email: string;
  company?: string;
  role?: string;
  interest: 'Acquisition' | 'Investment' | 'Partnership' | 'Product / Technology' | 'Other';
  message: string;
  honeypot?: string; // Hidden spam defense field
}

export interface BuyerInquiryResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

function sanitizeText(input?: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Strip basic HTML tags
    .slice(0, 2000); // Enforce max length
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function submitBuyerInquiryAction(
  data: BuyerInquiryPayload
): Promise<BuyerInquiryResult> {
  try {
    // 1. Honeypot check for spam bots
    if (data.honeypot && data.honeypot.trim().length > 0) {
      // Return fake success for bot without processing
      return {
        success: true,
        message: 'Your inquiry has been received. Our team will review and connect with you shortly.',
      };
    }

    const errors: Record<string, string> = {};

    // 2. Validate Name
    const name = sanitizeText(data.name);
    if (!name || name.length < 2) {
      errors.name = 'Please provide your full name (minimum 2 characters).';
    } else if (name.length > 100) {
      errors.name = 'Name cannot exceed 100 characters.';
    }

    // 3. Validate Email
    const email = sanitizeText(data.email).toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      errors.email = 'Please provide a valid corporate or professional email address.';
    }

    // 4. Validate Interest category
    const validInterests = ['Acquisition', 'Investment', 'Partnership', 'Product / Technology', 'Other'];
    if (!data.interest || !validInterests.includes(data.interest)) {
      errors.interest = 'Please select a valid area of interest.';
    }

    // 5. Validate Message
    const message = sanitizeText(data.message);
    if (!message || message.length < 10) {
      errors.message = 'Please provide a brief message outlining your inquiry (minimum 10 characters).';
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Please resolve the highlighted validation errors.',
        errors,
      };
    }

    const company = sanitizeText(data.company);
    const role = sanitizeText(data.role);

    // 6. Safe server-side processing log (sanitized, zero secrets exposed)
    const logPayload = {
      timestamp: new Date().toISOString(),
      category: 'BUYER_INVESTOR_INQUIRY',
      inquiry: {
        name,
        email,
        company: company || 'Not Specified',
        role: role || 'Not Specified',
        interest: data.interest,
        messageLength: message.length,
      },
    };

    console.info(JSON.stringify(logPayload));

    return {
      success: true,
      message: 'Thank you for your interest in Ventrexs AI. We have received your inquiry and will follow up with relevant documentation and discussion details.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'A temporary error occurred while processing your request. Please try again.',
    };
  }
}
