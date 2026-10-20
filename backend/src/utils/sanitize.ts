/**
 * Sanitizes input strings by escaping dangerous HTML entities
 * to prevent XSS and template injection while preserving UTF-8 / international characters (é, ñ, etc.)
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an HTML invoice document safely escaping client values
 */
export function renderInvoiceHtml(invoice: {
  invoice_number: string;
  client_name: string;
  client_address?: string | null;
  client_email?: string | null;
  project_name?: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  total_hours: number;
  currency: string;
  line_items: Array<{ description: string; hours: number; rate: number; amount: number }>;
  notes?: string | null;
}): string {
  const safeClientName = escapeHtml(invoice.client_name);
  const safeClientAddress = escapeHtml(invoice.client_address || '');
  const safeClientEmail = escapeHtml(invoice.client_email || '');
  const safeProjectName = escapeHtml(invoice.project_name || 'Project Services');
  const safeNotes = escapeHtml(invoice.notes || '');

  const itemsRows = invoice.line_items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(item.description)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.hours}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.rate.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.amount.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; }
    .details { margin-top: 30px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    th { background: #f8fafc; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
    .total-box { margin-top: 30px; text-align: right; }
    .total-amount { font-size: 20px; font-weight: bold; color: #059669; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">CLIENTPILOT</div>
      <p style="color: #64748b; font-size: 12px; margin: 4px 0;">Freelance Advisory & Engineering</p>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0;">INVOICE</h2>
      <p style="margin: 4px 0; font-family: monospace;">${invoice.invoice_number}</p>
    </div>
  </div>

  <div class="details">
    <div>
      <strong style="font-size: 11px; text-transform: uppercase; color: #64748b;">Billed To:</strong>
      <div style="font-size: 16px; font-weight: bold; margin-top: 4px;">${safeClientName}</div>
      <div style="color: #475569; font-size: 13px; margin-top: 2px;">${safeClientAddress}</div>
      <div style="color: #475569; font-size: 13px;">${safeClientEmail}</div>
    </div>
    <div style="text-align: right; font-size: 13px;">
      <p><strong>Project:</strong> ${safeProjectName}</p>
      <p><strong>Issue Date:</strong> ${invoice.issue_date}</p>
      <p><strong>Due Date:</strong> ${invoice.due_date}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Hours</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="total-box">
    <p>Total Hours: <strong>${invoice.total_hours} hrs</strong></p>
    <p class="total-amount">Total Due: $${invoice.total_amount.toFixed(2)} ${invoice.currency}</p>
  </div>

  ${safeNotes ? `<div style="margin-top: 40px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b;"><strong>Notes:</strong><p style="margin: 4px 0;">${safeNotes}</p></div>` : ''}
</body>
</html>`;
}
