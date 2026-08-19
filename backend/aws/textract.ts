import "dotenv/config";
import {
  GetExpenseAnalysisCommand,
  StartExpenseAnalysisCommand,
  TextractClient,
  type ExpenseDocument,
} from "@aws-sdk/client-textract";
import type { S3ObjectLocation } from "./s3.js";

const region = process.env.AWS_REGION;

if (!region) {
  throw new Error("AWS_REGION is missing");
}

const textract = new TextractClient({ region });

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

export type ExpenseAnalysisResult =
  | { status: "processing" }
  | { status: "failed"; message: string | null }
  | { status: "completed"; content: InvoiceContent };

export async function startExpenseAnalysis(
  s3Object: S3ObjectLocation,
): Promise<string> {
  const result = await textract.send(
    new StartExpenseAnalysisCommand({
      DocumentLocation: {
        S3Object: {
          Bucket: s3Object.bucket,
          Name: s3Object.key,
        },
      },
    }),
  );

  if (!result.JobId) {
    throw new Error("Textract did not return a JobId");
  }

  return result.JobId;
}

export async function getExpenseAnalysis(
  jobId: string,
): Promise<ExpenseAnalysisResult> {
  const firstPage = await textract.send(
    new GetExpenseAnalysisCommand({ JobId: jobId }),
  );

  if (firstPage.JobStatus === "IN_PROGRESS") {
    return { status: "processing" };
  }

  if (firstPage.JobStatus === "FAILED") {
    return {
      status: "failed",
      message: firstPage.StatusMessage ?? null,
    };
  }

  if (
    firstPage.JobStatus !== "SUCCEEDED" &&
    firstPage.JobStatus !== "PARTIAL_SUCCESS"
  ) {
    throw new Error(`Unexpected Textract job status: ${firstPage.JobStatus}`);
  }

  const expenseDocuments = [...(firstPage.ExpenseDocuments ?? [])];
  let nextToken = firstPage.NextToken;

  while (nextToken) {
    const nextPage = await textract.send(
      new GetExpenseAnalysisCommand({
        JobId: jobId,
        NextToken: nextToken,
      }),
    );

    expenseDocuments.push(...(nextPage.ExpenseDocuments ?? []));
    nextToken = nextPage.NextToken;
  }

  return {
    status: "completed",
    content: parseExpenseDocuments(expenseDocuments),
  };
}

function parseExpenseDocuments(
  expenseDocuments: ExpenseDocument[],
): InvoiceContent {
  const fields = expenseDocuments.flatMap(
    (document) => document.SummaryFields ?? [],
  );

  const findValue = (type: string): string | null =>
    fields.find((field) => field.Type?.Text === type)?.ValueDetection?.Text ??
    null;

  const currency =
    fields.find((field) => field.Type?.Text === "TOTAL")?.Currency?.Code ??
    null;

  return {
    vendorName: findValue("VENDOR_NAME"),
    invoiceNumber: findValue("INVOICE_RECEIPT_ID"),
    invoiceDate: findValue("INVOICE_RECEIPT_DATE"),
    dueDate: findValue("DUE_DATE"),
    currency,
    subtotal: findValue("SUBTOTAL"),
    tax: findValue("TAX"),
    total: findValue("TOTAL"),
  };
}
