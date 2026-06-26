type SalesforceContactQueryResponse = {
  totalSize: number;
  records: Array<{ Id: string }>;
};

type SalesforceUpdateContactInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

const API_VERSION = process.env.SALESFORCE_API_VERSION ?? "v60.0";

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

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function findContactByEmail(
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

  return result.records[0] ?? null;
}

export async function updateSalesforceContact(
  instanceUrl: string,
  accessToken: string,
  input: SalesforceUpdateContactInput
) {
  const contact = await findContactByEmail(instanceUrl, accessToken, input.email);

  if (!contact) {
    return null;
  }

  const fields = {
    ...(input.firstName ? { FirstName: input.firstName } : {}),
    ...(input.lastName ? { LastName: input.lastName } : {}),
    ...(input.phone ? { Phone: input.phone } : {})
  };

  await salesforceRequest<void>(instanceUrl, accessToken, `/sobjects/Contact/${contact.Id}`, {
    method: "PATCH",
    body: JSON.stringify(fields)
  });

  return { id: contact.Id };
}
