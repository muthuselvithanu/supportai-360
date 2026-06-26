export type CaseStatus = "New" | "Open" | "Pending" | "Escalated" | "Resolved" | string;

export type SupportCase = {
  id: string;
  number: string;
  subject: string;
  customer?: string;
  priority: "Low" | "Medium" | "High" | "Urgent" | string;
  status: CaseStatus;
  product?: string;
  contactName?: string;
  contactEmail?: string;
  updatedAt: string;
  createdAt: string;
  description?: string;
  nextStep?: string;
};

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  accountNumber: string;
  preferredContactMethod: "Email" | "Phone" | "SMS";
  timezone: string;
};

export type AgentforceMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
