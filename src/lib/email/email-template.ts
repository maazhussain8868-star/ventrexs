import { BRAND } from '@/config/brand';

export interface EmailTemplateParams {
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  customerName: string;
  customerCompany: string;
  invoiceNumber: string;
  invoiceId: string;
  remainingBalance: number;
  currency?: string;
  dueDate: string;
  messageBody: string;
}

export function renderInvoiceFollowUpEmail(params: EmailTemplateParams): { text: string; html: string } {
  const {
    businessName,
    businessEmail,
    businessPhone,
    customerName,
    customerCompany,
    invoiceNumber,
    invoiceId,
    remainingBalance,
    currency = 'USD',
    dueDate,
    messageBody,
  } = params;

  const balanceFormatted = `$${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const payUrl = `https://${BRAND.domain}/pay/${invoiceId}`;

  // Plaintext version
  const text = `${messageBody}

--------------------------------------------------
STATEMENT OF ACCOUNT
Invoice Number: ${invoiceNumber}
Verified Balance Due: ${balanceFormatted} ${currency}
Due Date: ${dueDate}
Review & Settle: ${payUrl}
--------------------------------------------------

Contact Information:
${businessName}
${businessEmail ? `Email: ${businessEmail}\n` : ''}${businessPhone ? `Phone: ${businessPhone}\n` : ''}`;

  // Clean, responsive, premium HTML version
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Statement - ${invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; }
    .header p { margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 32px; }
    .message-text { font-size: 14px; line-height: 1.65; color: #334155; white-space: pre-wrap; margin-bottom: 24px; }
    .statement-box { background: #f1f5f9; border-radius: 12px; border: 1px solid #cbd5e1; padding: 20px; margin: 24px 0; }
    .statement-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .statement-row:last-child { margin-bottom: 0; padding-top: 8px; border-top: 1px solid #cbd5e1; font-weight: 700; font-size: 15px; color: #0f172a; }
    .statement-label { color: #64748b; }
    .statement-value { color: #0f172a; text-align: right; }
    .btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 20px; border-radius: 10px; text-decoration: none; margin-top: 8px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${businessName}</h1>
      <p>Official Invoice Statement</p>
    </div>
    <div class="body">
      <div class="message-text">${messageBody.replace(/\n/g, '<br>')}</div>
      
      <div class="statement-box">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Invoice Number</td>
            <td style="text-align: right; font-weight: 600; color: #0f172a;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Due Date</td>
            <td style="text-align: right; font-weight: 600; color: #0f172a;">${dueDate}</td>
          </tr>
          <tr style="border-top: 1px solid #cbd5e1;">
            <td style="color: #0f172a; padding: 8px 0 0 0; font-weight: 700; font-size: 15px;">Legitimate Balance Due</td>
            <td style="text-align: right; color: #0f172a; padding: 8px 0 0 0; font-weight: 700; font-size: 16px; font-family: monospace;">${balanceFormatted}</td>
          </tr>
        </table>
      </div>

      <a href="${payUrl}" class="btn" style="color: #ffffff;">Review & Settle Invoice Balance</a>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;">This communication references only the verified original balance owed. Zero interest or late penalty charges are applied.</p>
      <p style="margin: 0;">${businessName}${businessEmail ? ` • ${businessEmail}` : ''}${businessPhone ? ` • ${businessPhone}` : ''}</p>
    </div>
  </div>
</body>
</html>`;

  return { text, html };
}
