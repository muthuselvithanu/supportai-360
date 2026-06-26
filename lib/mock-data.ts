import type { PortalUser, SupportCase } from "@/lib/types";

export const currentUser: PortalUser = {
  id: "usr_001",
  name: "Maya Chen",
  email: "maya.chen@example.com",
  phone: "+1 (317) 555-0148",
  company: "Acme Finance",
  accountNumber: "ACM-20481",
  preferredContactMethod: "Email",
  timezone: "America/Indianapolis"
};

export const mockCases: SupportCase[] = [
  {
    id: "case_001",
    number: "00024581",
    subject: "Billing sync failed after subscription renewal",
    customer: "Acme Finance",
    priority: "Urgent",
    status: "Escalated",
    product: "Billing Connector",
    contactName: "Maya Chen",
    updatedAt: "12 min ago",
    createdAt: "Jun 24, 2026",
    description:
      "The renewal completed, but invoice records have not synchronized to the customer workspace.",
    nextStep: "A support specialist is reviewing the latest billing export and entitlement status."
  },
  {
    id: "case_002",
    number: "00024577",
    subject: "Unable to access premium analytics dashboard",
    customer: "Acme Finance",
    priority: "High",
    status: "Open",
    product: "Analytics Dashboard",
    contactName: "Maya Chen",
    updatedAt: "38 min ago",
    createdAt: "Jun 24, 2026",
    description:
      "Users with premium access receive an authorization error when opening analytics reports.",
    nextStep: "Access rules are being checked against the active subscription entitlements."
  },
  {
    id: "case_003",
    number: "00024566",
    subject: "Request to update account security contacts",
    customer: "Acme Finance",
    priority: "Medium",
    status: "Pending",
    product: "Account Settings",
    contactName: "Maya Chen",
    updatedAt: "1 hr ago",
    createdAt: "Jun 23, 2026",
    description:
      "The customer account needs updated security contacts before the next compliance review.",
    nextStep: "Waiting on customer confirmation for the new primary security contact."
  },
  {
    id: "case_004",
    number: "00024539",
    subject: "Integration webhook retries producing duplicates",
    customer: "Acme Finance",
    priority: "High",
    status: "New",
    product: "Developer API",
    contactName: "Maya Chen",
    updatedAt: "2 hrs ago",
    createdAt: "Jun 23, 2026",
    description:
      "Webhook retry events appear to be creating duplicate task records in the connected system.",
    nextStep: "The support team will validate event ids and retry behavior."
  },
  {
    id: "case_005",
    number: "00024512",
    subject: "Change workspace admin for enterprise tenant",
    customer: "Acme Finance",
    priority: "Low",
    status: "Resolved",
    product: "Workspace Administration",
    contactName: "Maya Chen",
    updatedAt: "Yesterday",
    createdAt: "Jun 21, 2026",
    description:
      "The workspace administrator needed to be changed after a team role transition.",
    nextStep: "No action required. The requested administrator change has been completed."
  }
];

