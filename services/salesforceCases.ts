import type { SupportCase } from "@/lib/types";

export type SalesforceCasePriority = "Low" | "Medium" | "High";

export type SalesforceCaseInput = {
  subject: string;
  description: string;
  contactEmail: string;
  priority: SalesforceCasePriority;
};

type SalesforceContactQueryResponse = {
  totalSize: number;
  records: Array<{ Id: string }>;
};

type SalesforceCaseRecord = {
  Id: string;
  CaseNumber: string;
  Subject: string | null;
  Status: string | null;
  Priority: string | null;
  SuppliedEmail: string | null;
  Description: string | null;
  CreatedDate: string;
  LastModifiedDate: string;
  Contact?: {
    Name?: string | null;
    Email?: string | null;
  } | null;
};

type SalesforceCaseQueryResponse = {
  totalSize: number;
  records: SalesforceCaseRecord[];
};

type SalesforceCreateResponse = {
  id: string;
  success: boolean;
  errors: unknown[];
};

const API_VERSION = process.env.SALESFORCE_API_VERSION ?? "v60.0";
const CASE_FIELDS =
  "Id, CaseNumber, Subject, Status, Priority, SuppliedEmail, Description, CreatedDate, LastModifiedDate, Contact.Name, Contact.Email";

async function salesforceRequest<T>(
  instanceUrl: string,
  accessToken: string,
  path: string,
  init?: RequestInit
) {
  const response = await fetch(`${instanceUrl}/services/data/${API_VERSION}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Salesforce request failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as T;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatUpdated(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function mapCase(record: SalesforceCaseRecord): SupportCase {
  return {
    id: record.Id,
    number: record.CaseNumber,
    subject: record.Subject ?? "Untitled case",
    priority: record.Priority ?? "Medium",
    status: record.Status ?? "New",
    contactName: record.Contact?.Name ?? "Customer",
    contactEmail: record.Contact?.Email ?? record.SuppliedEmail ?? "",
    updatedAt: formatUpdated(record.LastModifiedDate),
    createdAt: formatDate(record.CreatedDate),
    description: record.Description ?? "No description provided.",
    nextStep: "Review this case in Salesforce for the latest owner, comments, and service activity."
  };
}

export async function findContactIdByEmail(
  instanceUrl: string,
  accessToken: string,
  email: string
) {
  const escapedEmail = email.replace(/'/g, "\\'");
  const query = encodeURIComponent(`SELECT Id FROM Contact WHERE Email = '${escapedEmail}' LIMIT 1`);
  const result = await salesforceRequest<SalesforceContactQueryResponse>(
    instanceUrl,
    accessToken,
    `/query?q=${query}`
  );

  return result.records[0]?.Id;
}

export async function listSalesforceCases(instanceUrl: string, accessToken: string) {
  const query = encodeURIComponent(
    `SELECT ${CASE_FIELDS} FROM Case ORDER BY LastModifiedDate DESC LIMIT 25`
  );
  const result = await salesforceRequest<SalesforceCaseQueryResponse>(
    instanceUrl,
    accessToken,
    `/query?q=${query}`
  );

  return result.records.map(mapCase);
}

export async function getSalesforceCaseById(
  instanceUrl: string,
  accessToken: string,
  caseId: string
) {
  const escapedId = caseId.replace(/'/g, "\\'");
  const query = encodeURIComponent(`SELECT ${CASE_FIELDS} FROM Case WHERE Id = '${escapedId}' LIMIT 1`);
  const result = await salesforceRequest<SalesforceCaseQueryResponse>(
    instanceUrl,
    accessToken,
    `/query?q=${query}`
  );

  return result.records[0] ? mapCase(result.records[0]) : null;
}

export async function createSalesforceCase(
  instanceUrl: string,
  accessToken: string,
  input: SalesforceCaseInput
) {
  const contactId = await findContactIdByEmail(instanceUrl, accessToken, input.contactEmail);

  return salesforceRequest<SalesforceCreateResponse>(instanceUrl, accessToken, "/sobjects/Case/", {
    method: "POST",
    body: JSON.stringify({
      Subject: input.subject,
      Description: input.description,
      Origin: "Web",
      Status: "New",
      Priority: input.priority,
      SuppliedEmail: input.contactEmail,
      ...(contactId ? { ContactId: contactId } : {})
    })
  });
}
