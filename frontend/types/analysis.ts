export type InvoiceContent = {
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  currency: string | null;
  subtotal: string | null;
  tax: string | null;
  total: string | null;
};

export type Analysis = {
  id: string;
  title: string;
  content: InvoiceContent | null;
  externalJobId: string;
  s3Key: string | null;
  mimeType: string | null;
  status: "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
};
