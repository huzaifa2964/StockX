"use client";

import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";

type InvoicePreviewProps = {
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    productName: string;
    skuCode: string;
    category: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  status?: string;
};

const invoiceStatusStyles: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-800",
  Partial: "bg-amber-100 text-amber-800",
  Pending: "bg-slate-200 text-slate-800",
};

function currency(value: number) {
  return `Rs ${value.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  (
    {
      invoiceNumber,
      customerName,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      paidAmount,
      balanceDue,
      notes,
      status,
    },
    ref
  ) => {
    const formattedInvoiceDate = new Date(invoiceDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedDueDate = new Date(dueDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div
        ref={ref}
        className="w-full max-w-4xl bg-white p-8 text-slate-900"
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "14px",
        }}
      >
        {/* Header */}
        <div className="mb-8 border-b-2 border-slate-300 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
              <p className="mt-1 text-sm text-slate-600">Al-Noor Beverages Distribution</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{invoiceNumber}</p>
              {status && (
                <Badge
                  className={`mt-2 rounded px-3 py-1 text-xs font-semibold ${
                    invoiceStatusStyles[status] || invoiceStatusStyles.Pending
                  }`}
                >
                  {status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bill To</h3>
            <p className="mt-2 text-base font-semibold text-slate-900">{customerName}</p>
          </div>
          <div className="text-right">
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Date</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{formattedInvoiceDate}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Due Date</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{formattedDueDate}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Product
                </th>
                <th className="py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  SKU
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  Qty
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  Unit Price
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const lineTotal = item.quantity * item.unitPrice;
                return (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="py-4 text-sm text-slate-900">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </td>
                    <td className="py-4 text-center text-sm text-slate-600">{item.skuCode}</td>
                    <td className="py-4 text-right text-sm font-medium text-slate-900">{item.quantity}</td>
                    <td className="py-4 text-right text-sm text-slate-600">{currency(item.unitPrice)}</td>
                    <td className="py-4 text-right text-sm font-semibold text-slate-900">{currency(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mb-8 flex justify-end">
          <div className="w-full max-w-xs">
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Subtotal:</span>
                <span className="text-sm font-semibold text-slate-900">{currency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Amount Received:</span>
                <span className="text-sm font-semibold text-emerald-600">{currency(paidAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">Balance Due:</span>
                  <span className="text-base font-bold text-blue-600">{currency(balanceDue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes</h3>
            <p className="mt-2 text-sm text-slate-700">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-500">
            Generated on {new Date().toLocaleDateString("en-GB")} at{" "}
            {new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            This is a computer-generated invoice. No signature is required.
          </p>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
