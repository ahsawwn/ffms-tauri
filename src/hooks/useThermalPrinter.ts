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

function PRINT_CSS(width: string): string {
  return '<style>'
    + '@page { size: ' + width + ' auto; margin: 0mm; }'
    + '* { box-sizing: border-box; }'
    + 'html, body { margin: 0; padding: 0; height: auto; overflow: hidden; }'
    + 'body { font-family: monospace, monospace; font-size: 12px; line-height: 1.2; color: #000; padding: 4px 6px 2px 6px; }'
    + '.receipt { width: ' + width + '; min-width: ' + width + '; max-width: ' + width + '; margin: 0 auto; page-break-after: avoid; page-break-inside: avoid; }'
    + '.center { text-align: center; }'
    + '.bold { font-weight: 900; text-transform: uppercase; }'
    + '.dash { border-top: 1px dashed #000; margin: 4px 0; }'
    + '.row { display: flex; justify-content: space-between; margin: 1px 0; }'
    + '.row.total { font-weight: 900; border-top: 1px dashed #000; padding-top: 3px; margin-top: 4px; }'
    + '.cut { margin-top: 4px; text-align: center; font-size: 10px; }'
    + '@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }'
    + '</style>';
}

function renderReceiptHtml(data: ReceiptData): string {
  const s = data.settings ?? {};
  const items = data.items.map(function (it) {
    const note = it.note ? ' (' + it.note + ')' : '';
    return '<div class="row"><span>' + it.quantity + 'x ' + it.name + note + '</span><span>' + (it.quantity * it.unitPrice).toFixed(0) + '</span></div>';
  }).join('');
  const logoHtml = (s.showLogo && s.logoUrl)
    ? '<div class="center" style="margin-bottom:6px"><img src="' + s.logoUrl + '" alt="logo" style="max-width:60%;max-height:60px;margin:0 auto;display:block" /></div>'
    : '';
  const nameHtml = (s.showLogo && !s.logoUrl)
    ? '<div class="center bold" style="font-size:18px">' + (s.restaurantName ?? 'Nerve Fast Food') + '</div>'
    : (s.showLogo && s.logoUrl ? '<div class="center bold" style="font-size:16px;margin-top:4px">' + (s.restaurantName ?? 'Nerve Fast Food') + '</div>' : '');
  const width = s.printerWidth === '58mm' ? '58mm' : '80mm';
  const tableRow = data.tableNumber ? '<div class="row"><span>Table:</span><span>' + data.tableNumber + '</span></div>' : '';
  return '<html><head>' + PRINT_CSS(width) + '</head><body>'
    + '<div class="receipt">'
    + logoHtml
    + nameHtml
    + '<div class="center" style="font-size:10px">' + (s.tagline ?? '') + '</div>'
    + '<div class="center" style="font-size:10px">' + (s.address ?? '') + '</div>'
    + '<div class="center" style="font-size:10px">Tel: ' + (s.phone ?? '') + '</div>'
    + '<div class="center" style="font-size:10px">TRN: ' + (s.taxRegistrationNumber ?? '') + '</div>'
    + '<div class="dash"></div>'
    + '<div class="row"><span>Order:</span><span>' + data.orderNumber + '</span></div>'
    + '<div class="row"><span>Type:</span><span>' + data.orderType + '</span></div>'
    + '<div class="row"><span>Cashier:</span><span>' + data.cashier + '</span></div>'
    + tableRow
    + '<div class="dash"></div>'
    + items
    + '<div class="dash"></div>'
    + '<div class="row"><span>Subtotal</span><span>' + data.subtotal.toFixed(0) + '</span></div>'
    + '<div class="row"><span>Tax</span><span>' + data.tax.toFixed(0) + '</span></div>'
    + '<div class="row"><span>Discount</span><span>-' + data.discount.toFixed(0) + '</span></div>'
    + '<div class="row total"><span>Total</span><span>' + data.total.toFixed(0) + '</span></div>'
    + '<div class="row"><span>Cash</span><span>' + data.cashReceived.toFixed(0) + '</span></div>'
    + '<div class="row"><span>Change</span><span>' + data.change.toFixed(0) + '</span></div>'
    + (s.raastQrDataUrl ? '<div class="dash"></div><div class="center" style="font-size:10px;font-weight:900">PAY VIA RAAST</div><div class="center"><img src="' + s.raastQrDataUrl + '" alt="raast qr" style="width:40mm;height:40mm;margin:4px auto;display:block" /></div><div class="center" style="font-size:9px">' + (s.raast?.accountTitle ?? '') + '</div><div class="center" style="font-size:9px">' + (s.raast?.iban ?? '') + '</div>' : '')
    + '<div class="dash"></div>'
    + '<div class="center" style="font-size:10px">' + (s.footerMessage ?? 'Thank you for dining with us!') + '</div>'
    + '<div class="cut">|||| |||| ||||</div>'
    + '</div>'
    + '</body></html>';
}

function renderKotHtml(data: ReceiptData): string {
  const items = data.items.map(function (it) {
    const note = it.note ? ' (' + it.note + ')' : '';
    return '<div style="font-size:18px; font-weight:900; text-transform:uppercase; margin:4px 0;">' + it.quantity + 'x ' + it.name + note + '</div>';
  }).join('');
  const width = data.settings?.printerWidth === '58mm' ? '58mm' : '80mm';
  const tableRow = data.tableNumber ? '<div class="center" style="font-size:14px">Table: ' + data.tableNumber + '</div>' : '';
  const nameRow = data.customerName ? '<div class="center" style="font-size:14px">Name: ' + data.customerName + '</div>' : '';
  return '<html><head>' + PRINT_CSS(width) + '</head><body>'
    + '<div class="receipt">'
    + '<div class="center bold" style="font-size:22px">*** KOT ***</div>'
    + '<div class="center bold" style="font-size:16px">' + data.orderType + '</div>'
    + tableRow
    + nameRow
    + '<div class="dash"></div>'
    + '<div class="row" style="font-size:14px"><span>Order:</span><span>' + data.orderNumber + '</span></div>'
    + '<div class="dash"></div>'
    + items
    + '<div class="dash"></div>'
    + '<div class="center" style="font-size:10px">Rush Order</div>'
    + '</div>'
    + '</body></html>';
}

export function useThermalPrinter() {
  const ensureStyled = function (html: string): string {
    const lower = html.toLowerCase();
    if (lower.includes('<style') || lower.includes('<html')) return html;
    return '<html><head>' + PRINT_CSS('80mm') + '</head><body>' + html + '</body></html>';
  };

  const printWindow = useCallback(function (html: string) {
    const styled = ensureStyled(html);
    let win: Window | null = null;
    try {
      win = window.open('', '_blank', 'width=360,height=640,noopener=yes');
    } catch (e) { win = null; }

    if (win) {
      try {
        win.document.write(styled);
        win.document.close();
        win.focus();
        setTimeout(function () { try { if (win) { win.focus(); win.print(); } } catch (e) { console.error('print failed', e); } }, 500);
        setTimeout(function () { try { if (win) win.close(); } catch (e) {} }, 1500);
      } catch (e) {
        console.error('print window write failed', e);
        win = null;
      }
    }

    if (!win) {
      const existing = document.getElementById('nerve-print-frame') as HTMLIFrameElement | null;
      const iframe = existing ?? (function () {
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
          doc.write(styled);
          doc.close();
          setTimeout(function () {
            try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch (e) { console.error('iframe print failed', e); }
          }, 500);
        }
      } catch (e) {
        console.error('iframe print setup failed', e);
      }
    }
    return win;
  }, []);

  const buildEscPos = useCallback(function (data: any) {
    const ESC = '\x1B';
    const lines = [
      ESC + '@',
      ESC + 'a' + '\x01',
      data.settings?.restaurantName ?? 'Nerve Fast Food',
      data.settings?.tagline ?? '',
      ESC + 'a' + '\x00',
      'Order: ' + data.orderNumber,
      'Type: ' + data.orderType,
      '------------------------',
      ...data.items.map(function (i: any) { return i.quantity + 'x ' + i.name + ' ' + (i.quantity * i.unitPrice).toFixed(0); }),
      '------------------------',
      'Total: ' + data.total.toFixed(0),
      'Cash: ' + data.cashReceived.toFixed(0),
      'Change: ' + data.change.toFixed(0),
      data.settings?.footerMessage ?? '',
      ESC + 'd' + '\x03',
      ESC + 'm',
    ];
    return lines.join('\n');
  }, []);

  const printReceipt = useCallback(function (html: string, escPos?: string) {
    printWindow(html);
    if (escPos) console.log('ESC/POS payload:', escPos);
  }, [printWindow]);

  const printKot = useCallback(function (html: string) {
    printWindow(html);
  }, [printWindow]);

  const printTest = useCallback(function (settings: any) {
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
