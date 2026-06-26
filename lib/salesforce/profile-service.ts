import { currentUser } from "@/lib/mock-data";
import type { PortalUser } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<PortalUser> {
  return currentUser;
}
