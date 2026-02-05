/**
 * FinAPI Bank Integration Service
 * Dokumentation: https://docs.finapi.io/
 */

interface FinAPIConfig {
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
  redirectUri: string;
}

interface FinAPIToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface Bank {
  id: number;
  name: string;
  bic: string;
  blz: string;
  location: string | null;
  city: string | null;
  isSupported: boolean;
  loginHint: string | null;
}

interface BankConnection {
  id: number;
  bankId: number;
  name: string | null;
  bankingUserId: string | null;
  bankingCustomerId: string | null;
  bankingPin: string | null;
  type: string;
  updateStatus: string;
  categorizationStatus: string;
  lastSuccessfulUpdate: string | null;
  accountIds: number[];
}

interface Account {
  id: number;
  bankConnectionId: number;
  accountName: string | null;
  iban: string;
  accountNumber: string;
  accountHolderName: string | null;
  accountCurrency: string;
  accountType: string;
  balance: number;
  overdraft: number | null;
  overdraftLimit: number | null;
  availableFunds: number | null;
  lastSuccessfulUpdate: string | null;
  lastUpdateAttempt: string | null;
}

interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  currency: string;
  valueDate: string;
  bankBookingDate: string;
  finapiBookingDate: string;
  counterpartName: string | null;
  counterpartAccountNumber: string | null;
  counterpartIban: string | null;
  counterpartBic: string | null;
  counterpartBankName: string | null;
  purpose: string | null;
  type: string;
  typeCodeZka: string | null;
  sepaPurposeCode: string | null;
  primaNotaNo: string | null;
  category: { id: number; name: string; parentName: string | null } | null;
}

// FinAPI Client Singleton
class FinAPIClient {
  private config: FinAPIConfig;
  private baseUrl: string;
  private clientToken: FinAPIToken | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      clientId: process.env.FINAPI_CLIENT_ID || '',
      clientSecret: process.env.FINAPI_CLIENT_SECRET || '',
      sandbox: process.env.FINAPI_SANDBOX === 'true',
      redirectUri: process.env.FINAPI_REDIRECT_URI || 'http://localhost:5173/bank-callback',
    };

    this.baseUrl = this.config.sandbox
      ? 'https://sandbox.finapi.io'
      : 'https://live.finapi.io';
  }

  // Client Credentials Token holen (für App-Level Zugriff)
  async getClientToken(): Promise<string> {
    // Token im Cache prüfen
    if (this.clientToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.clientToken.access_token;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FinAPI Auth Error: ${error}`);
    }

    this.clientToken = await response.json();
    // Token 5 Minuten vor Ablauf erneuern
    this.tokenExpiry = new Date(Date.now() + ((this.clientToken!.expires_in - 300) * 1000));

    return this.clientToken!.access_token;
  }

  // User Token mit Authorization Code holen
  async getUserToken(authorizationCode: string): Promise<FinAPIToken> {
    const response = await fetch(`${this.baseUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: authorizationCode,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FinAPI Token Exchange Error: ${error}`);
    }

    return response.json();
  }

  // User Token mit Refresh Token erneuern
  async refreshUserToken(refreshToken: string): Promise<FinAPIToken> {
    const response = await fetch(`${this.baseUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FinAPI Refresh Token Error: ${error}`);
    }

    return response.json();
  }

  // API Request Helper
  private async apiRequest<T>(
    endpoint: string,
    userToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FinAPI API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Banken suchen
  async searchBanks(query: string, userToken: string): Promise<Bank[]> {
    const params = new URLSearchParams({
      search: query,
      isSupported: 'true',
    });

    const result = await this.apiRequest<{ banks: Bank[] }>(
      `/api/v1/banks?${params}`,
      userToken
    );

    return result.banks;
  }

  // Bank-Verbindung URL generieren (für Web Form)
  async getBankConnectionUrl(bankId: number, userToken: string): Promise<string> {
    const result = await this.apiRequest<{ url: string }>(
      '/api/v1/webForms/bankConnectionImport',
      userToken,
      {
        method: 'POST',
        body: JSON.stringify({
          bankId,
          callbacks: {
            finalised: this.config.redirectUri,
          },
        }),
      }
    );

    return result.url;
  }

  // Alle Bank-Verbindungen abrufen
  async getBankConnections(userToken: string): Promise<BankConnection[]> {
    const result = await this.apiRequest<{ connections: BankConnection[] }>(
      '/api/v1/bankConnections',
      userToken
    );

    return result.connections;
  }

  // Bank-Verbindung aktualisieren
  async updateBankConnection(
    connectionId: number,
    userToken: string
  ): Promise<BankConnection> {
    return this.apiRequest<BankConnection>(
      `/api/v1/bankConnections/${connectionId}/update`,
      userToken,
      { method: 'POST' }
    );
  }

  // Bank-Verbindung löschen
  async deleteBankConnection(connectionId: number, userToken: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/v1/bankConnections/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });
  }

  // Konten abrufen
  async getAccounts(userToken: string, accountIds?: number[]): Promise<Account[]> {
    let endpoint = '/api/v1/accounts';
    if (accountIds && accountIds.length > 0) {
      endpoint += `?ids=${accountIds.join(',')}`;
    }

    const result = await this.apiRequest<{ accounts: Account[] }>(endpoint, userToken);
    return result.accounts;
  }

  // Transaktionen abrufen
  async getTransactions(
    userToken: string,
    options: {
      accountIds?: number[];
      minDate?: string;
      maxDate?: string;
      page?: number;
      perPage?: number;
    } = {}
  ): Promise<{ transactions: Transaction[]; paging: { page: number; perPage: number; totalCount: number } }> {
    const params = new URLSearchParams();

    if (options.accountIds?.length) {
      params.append('accountIds', options.accountIds.join(','));
    }
    if (options.minDate) {
      params.append('minBankBookingDate', options.minDate);
    }
    if (options.maxDate) {
      params.append('maxBankBookingDate', options.maxDate);
    }
    params.append('page', String(options.page || 1));
    params.append('perPage', String(options.perPage || 100));
    params.append('order', 'bankBookingDate,desc');

    return this.apiRequest(`/api/v1/transactions?${params}`, userToken);
  }

  // Kontostand abrufen
  async getAccountBalance(accountId: number, userToken: string): Promise<number> {
    const accounts = await this.getAccounts(userToken, [accountId]);
    return accounts[0]?.balance || 0;
  }
}

// Singleton Export
export const finapi = new FinAPIClient();

// Helper: FinAPI Transaktionen in Fintutto-Format konvertieren
export function convertFinAPITransaction(tx: Transaction, companyId: string) {
  const isIncome = tx.amount > 0;

  return {
    company_id: companyId,
    external_id: `finapi_${tx.id}`,
    type: isIncome ? 'income' : 'expense',
    amount: Math.abs(tx.amount),
    description: tx.purpose || tx.counterpartName || 'FinAPI Import',
    category: mapFinAPICategory(tx.category?.name),
    date: tx.valueDate,
    counterpart_name: tx.counterpartName,
    counterpart_iban: tx.counterpartIban,
    source: 'finapi',
  };
}

// FinAPI Kategorien auf Fintutto Kategorien mappen
function mapFinAPICategory(finapiCategory: string | undefined): string | null {
  if (!finapiCategory) return null;

  const categoryMap: Record<string, string> = {
    'Gehalt': 'Einnahmen',
    'Lohn': 'Einnahmen',
    'Einkommen': 'Einnahmen',
    'Miete': 'Miete',
    'Wohnen': 'Miete',
    'Telefon': 'Telekommunikation',
    'Internet': 'Telekommunikation',
    'Versicherung': 'Versicherungen',
    'Büro': 'Büromaterial',
    'Reise': 'Reisekosten',
    'Werbung': 'Marketing',
    'Personal': 'Gehälter',
  };

  for (const [key, value] of Object.entries(categoryMap)) {
    if (finapiCategory.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return 'Sonstiges';
}

// Token-Speicherung Interface (wird von der Anwendung implementiert)
export interface FinAPITokenStore {
  saveTokens(userId: string, tokens: FinAPIToken): Promise<void>;
  getTokens(userId: string): Promise<FinAPIToken | null>;
  deleteTokens(userId: string): Promise<void>;
}
