import { currentUser } from "@/lib/mock-data";
import type { PortalUser } from "@/lib/types";

export async function getSessionUser(): Promise<PortalUser | null> {
  return currentUser;
}

export async function signInWithEmail(email: string, password: string) {
  void email;
  void password;
  return {
    user: currentUser,
    requiresSalesforceConnection: true
  };
}

