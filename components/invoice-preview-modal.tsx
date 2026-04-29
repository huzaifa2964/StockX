"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoicePreview } from "@/components/invoice-preview";
import { Download, Printer, X } from "lucide-react";

type InvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
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

export function InvoicePreviewModal({
  isOpen,
  onClose,
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
}: InvoiceModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=auto,width=auto");
    if (printWindow && previewRef.current) {
      const printContent = previewRef.current.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${invoiceNumber} - Al-Noor Beverages</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 14px;
              color: #1e293b;
              background: white;
              line-height: 1.5;
            }
            @page {
              size: A4;
              margin: 0.5in;
            }
            @media print {
              body {
                background: white;
              }
              .no-print {
                display: none !important;
              }
            }
            h1 {
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td, th {
              padding: 8px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      // Use dynamic import to avoid issues with html2pdf
      const html2pdf = (await import("html2pdf.js")).default;

      const options = {
        margin: 10,
        filename: `Invoice_${invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait" as const, unit: "mm" as const, format: "a4" },
      };

      html2pdf().set(options).from(previewRef.current).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <Card className="w-full max-h-[90vh] max-w-4xl border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-semibold text-slate-950">Invoice Preview</CardTitle>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="bg-slate-100 p-8">
            <InvoicePreview
              ref={previewRef}
              invoiceNumber={invoiceNumber}
              customerName={customerName}
              invoiceDate={invoiceDate}
              dueDate={dueDate}
              items={items}
              subtotal={subtotal}
              paidAmount={paidAmount}
              balanceDue={balanceDue}
              notes={notes}
              status={status}
            />
          </div>
        </CardContent>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button variant="outline" onClick={onClose} className="rounded-full">
            Close
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="rounded-full flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="rounded-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
