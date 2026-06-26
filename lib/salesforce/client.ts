type SalesforceClientConfig = {
  instanceUrl?: string;
  accessToken?: string;
};

export class SalesforceClient {
  private config: SalesforceClientConfig;

  constructor(config: SalesforceClientConfig = {}) {
    this.config = config;
  }

  isConfigured() {
    return Boolean(this.config.instanceUrl && this.config.accessToken);
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    void path;
    void init;
    if (!this.isConfigured()) {
      throw new Error("Salesforce client is not configured yet.");
    }

    throw new Error("Salesforce API transport is not implemented yet.");
  }
}

export const salesforceClient = new SalesforceClient();

