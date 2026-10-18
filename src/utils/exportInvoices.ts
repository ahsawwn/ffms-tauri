import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function rows(orders: any[], users: Record<string, string>) {
  return orders.map((o) => ({
    'Order #': o.orderNumber,
    Date: o.createdAt ?? '',
    Cashier: users[o.userId] ?? o.userId,
    Type: o.orderType,
    Payment: o.paymentMethod ?? '',
    Total: o.totalAmount,
    Status: o.status,
  }));
}

export function exportCsv(orders: any[], users: Record<string, string>, _products: Record<string, string>) {
  const data = rows(orders, users);
  const headers = ['Order #', 'Date', 'Cashier', 'Type', 'Payment', 'Total', 'Status'];
  const csv = [headers.join(','), ...data.map((r: any) => headers.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'invoices-' + Date.now() + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function exportXlsx(orders: any[], users: Record<string, string>, _products: Record<string, string>) {
  const data = rows(orders, users);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
  XLSX.writeFile(wb, 'invoices-' + Date.now() + '.xlsx');
}

export function exportPdf(orders: any[], users: Record<string, string>, _products: Record<string, string>) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Nerve FFMS - Invoices', 14, 16);
  doc.setFontSize(9);
  autoTable(doc, {
    startY: 22,
    head: [['Order #', 'Date', 'Cashier', 'Type', 'Payment', 'Total', 'Status']],
    body: orders.map((o) => [
      o.orderNumber, o.createdAt ?? '', users[o.userId] ?? o.userId, o.orderType,
      o.paymentMethod ?? '', 'PKR ' + o.totalAmount, o.status,
    ]),
    styles: { fontSize: 8 },
  });
  doc.save('invoices-' + Date.now() + '.pdf');
}
