import { useCallback } from 'react';

export interface ReceiptItem { name: string; quantity: number; unitPrice: number; note?: string; }
export interface ReceiptData {
  orderNumber: string;
  orderType: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  cashReceived: number;
  change: number;
  cashier: string;
  settings: any;
  tableNumber?: string;
  customerName?: string;
}

const PRINT_CSS = `
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; }
    body { font-family: monospace, monospace; font-size: 12px; line-height: 1.25; color: #000; margin: 0; padding: 6px; }
    .receipt { width: 80mm; min-width: 80mm; max-width: 80mm; margin: 0 auto; }
    .center { text-align: center; }
    .bold { font-weight: 900; text-transform: uppercase; }
    .dash { border-top: 1px dashed #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .row.total { font-weight: 900; border-top: 1px dashed #000; padding-top: 4px; margin-top: 6px; }
    .cut { margin-top: 8px; text-align: center; font-size: 10px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
`;

function renderReceiptHtml(data: ReceiptData): string {
  const s = data.settings ?? {};
  const items = data.items.map((it) => `
    <div class="row">
      <span>${it.quantity}x ${it.name}${it.note ? ` (${it.note})` : ''}</span>
      <span>${(it.quantity * it.unitPrice).toFixed(0)}</span>
    </div>`).join('');
  return `
    <html><head>${PRINT_CSS}</head><body>
      <div class="receipt">
        ${s.showLogo ? `<div class="center bold" style="font-size:18px">${s.restaurantName ?? 'Nerve Fast Food'}</div>` : ''}
        <div class="center" style="font-size:10px">${s.tagline ?? ''}</div>
        <div class="center" style="font-size:10px">${s.address ?? ''}</div>
        <div class="center" style="font-size:10px">Tel: ${s.phone ?? ''}</div>
        <div class="center" style="font-size:10px">TRN: ${s.taxRegistrationNumber ?? ''}</div>
        <div class="dash"></div>
        <div class="row"><span>Order:</span><span>${data.orderNumber}</span></div>
        <div class="row"><span>Type:</span><span>${data.orderType}</span></div>
        <div class="row"><span>Cashier:</span><span>${data.cashier}</span></div>
        ${data.tableNumber ? `<div class="row"><span>Table:</span><span>${data.tableNumber}</span></div>` : ''}
        <div class="dash"></div>
        ${items}
        <div class="dash"></div>
        <div class="row"><span>Subtotal</span><span>${data.subtotal.toFixed(0)}</span></div>
        <div class="row"><span>Tax</span><span>${data.tax.toFixed(0)}</span></div>
        <div class="row"><span>Discount</span><span>-${data.discount.toFixed(0)}</span></div>
        <div class="row total"><span>Total</span><span>${data.total.toFixed(0)}</span></div>
        <div class="row"><span>Cash</span><span>${data.cashReceived.toFixed(0)}</span></div>
        <div class="row"><span>Change</span><span>${data.change.toFixed(0)}</span></div>
        <div class="dash"></div>
        <div class="center" style="font-size:10px">${s.footerMessage ?? 'Thank you for dining with us!'}</div>
        <div class="cut">|||| |||| ||||</div>
      </div>
      <script>
        setTimeout(() => { try { window.print(); } catch (e) { console.error('print failed', e); } setTimeout(() => { try { window.close(); } catch (e) {} }, 800); }, 400);
      </script>
    </body></html>`;
}

function renderKotHtml(data: ReceiptData): string {
  const items = data.items.map((it) => `
    <div style="font-size:18px; font-weight:900; text-transform:uppercase; margin:4px 0;">
      ${it.quantity}x ${it.name}${it.note ? ` (${it.note})` : ''}
    </div>`).join('');
  return `
    <html><head>${PRINT_CSS}</head><body>
      <div class="receipt">
        <div class="center bold" style="font-size:22px">*** KOT ***</div>
        <div class="center bold" style="font-size:16px">${data.orderType}</div>
        ${data.tableNumber ? `<div class="center" style="font-size:14px">Table: ${data.tableNumber}</div>` : ''}
        ${data.customerName ? `<div class="center" style="font-size:14px">Name: ${data.customerName}</div>` : ''}
        <div class="dash"></div>
        <div class="row" style="font-size:14px"><span>Order:</span><span>${data.orderNumber}</span></div>
        <div class="dash"></div>
        ${items}
        <div class="dash"></div>
        <div class="center" style="font-size:10px">Rush Order</div>
      </div>
      <script>
        setTimeout(() => { try { window.print(); } catch (e) { console.error('kot print failed', e); } setTimeout(() => { try { window.close(); } catch (e) {} }, 800); }, 400);
      </script>
    </body></html>`;
}

export function useThermalPrinter() {
  const printWindow = useCallback((html: string) => {
    // Try popup window first (works for thermal/desktop printing).
    let win: Window | null = null;
    try {
      win = window.open('', '_blank', `width=360,height=640,noopener=yes`);
    } catch (e) { win = null; }

    if (win) {
      try {
        win.document.write(html);
        win.document.close();
        win.focus();
      } catch (e) {
        console.error('print window write failed', e);
        win = null;
      }
    }

    // Fallback: hidden iframe + browser print (popup-blocker safe).
    if (!win) {
      const existing = document.getElementById('nerve-print-frame') as HTMLIFrameElement | null;
      const iframe = existing ?? (() => {
        const el = document.createElement('iframe');
        el.id = 'nerve-print-frame';
        el.style.position = 'absolute';
        el.style.width = '0';
        el.style.height = '0';
        el.style.border = '0';
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
        return el;
      })();
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
          setTimeout(() => {
            try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch (e) { console.error('iframe print failed', e); }
          }, 300);
        }
      } catch (e) {
        console.error('iframe print setup failed', e);
      }
    }
    return win;
  }, []);

  const buildEscPos = useCallback((data: ReceiptData) => {
    const ESC = '\x1B';
    const lines = [
      ESC + '@',
      ESC + 'a' + '\x01',
      data.settings?.restaurantName ?? 'Nerve Fast Food',
      data.settings?.tagline ?? '',
      ESC + 'a' + '\x00',
      `Order: ${data.orderNumber}`,
      `Type: ${data.orderType}`,
      '------------------------',
      ...data.items.map((i: ReceiptItem) => `${i.quantity}x ${i.name} ${(i.quantity * i.unitPrice).toFixed(0)}`),
      '------------------------',
      `Total: ${data.total.toFixed(0)}`,
      `Cash: ${data.cashReceived.toFixed(0)}`,
      `Change: ${data.change.toFixed(0)}`,
      data.settings?.footerMessage ?? '',
      ESC + 'd' + '\x03',
      ESC + 'm',
    ];
    return lines.join('\n');
  }, []);

  const printReceipt = useCallback((html: string, escPos?: string) => {
    printWindow(html);
    if (escPos) console.log('ESC/POS payload:', escPos);
  }, [printWindow]);

  const printKot = useCallback((html: string) => {
    printWindow(html);
  }, [printWindow]);

  const printTest = useCallback((settings: any) => {
    const test: ReceiptData = {
      orderNumber: 'TEST-0001',
      orderType: 'DINE_IN',
      items: [{ name: 'Test Print Line', quantity: 1, unitPrice: 100 }],
      subtotal: 100, tax: 5, discount: 0, total: 105, cashReceived: 105, change: 0,
      cashier: 'Test', settings, tableNumber: 'Table 1', customerName: 'Test Customer',
    };
    printWindow(renderReceiptHtml(test));
  }, [printWindow]);

  return { printReceipt, printKot, buildEscPos, printTest, renderReceiptHtml, renderKotHtml };
}
