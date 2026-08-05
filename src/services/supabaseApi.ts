import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fieldErrors = payload.fields
      ? ` (${Object.entries(payload.fields).map(([field, message]) => `${field}: ${message}`).join(', ')})`
      : '';
    throw new Error(`${payload.error || 'Erro ao comunicar com a API.'}${fieldErrors}`);
  }
  return payload.data as T;
}

export const authService = {
  async signUp(input: { name: string; email: string; password: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name },
      },
    });

    if (error) throw error;
    localStorage.setItem('pixelconta_pending_user_name', input.name);
    return data;
  },

  async signIn(input: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(input);
    if (error) throw error;
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};

export const onboardingService = {
  async setupCompany(input: Record<string, unknown>) {
    const userName = localStorage.getItem('pixelconta_pending_user_name');
    const data = await apiRequest('/api/onboarding/setup', {
      method: 'POST',
      body: JSON.stringify({ ...input, userName }),
    });
    localStorage.removeItem('pixelconta_pending_user_name');
    return data;
  },
};

export const sessionService = {
  status() {
    return apiRequest<{
      hasProfile: boolean;
      hasActiveCompany: boolean;
      profile: null | {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar_url: string | null;
        active_company_id: string | null;
      };
      companies: Array<{
        id: string;
        legal_name: string;
        trade_name: string | null;
        cnpj: string;
        status: string;
        role: string;
      }>;
    }>('/api/session/status');
  },

  setActiveCompany(companyId: string) {
    return apiRequest<{
      profile: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar_url: string | null;
        active_company_id: string | null;
      };
    }>('/api/session/active-company', {
      method: 'PATCH',
      body: JSON.stringify({ company_id: companyId }),
    });
  },
};

export const databaseService = {
  list<T>(table: string, query = '') {
    return apiRequest<T[]>(`/api/db/${table}${query}`);
  },

  get<T>(table: string, id: string, query = '') {
    return apiRequest<T>(`/api/db/${table}/${id}${query}`);
  },

  create<T>(table: string, data: Record<string, unknown>) {
    return apiRequest<T>(`/api/db/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update<T>(table: string, id: string, data: Record<string, unknown>) {
    return apiRequest<T>(`/api/db/${table}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove(table: string, id: string) {
    return apiRequest<null>(`/api/db/${table}/${id}`, {
      method: 'DELETE',
    });
  },
};

export const documentService = {
  create(data: Record<string, unknown>) {
    return apiRequest<any>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  remove(id: string) {
    return apiRequest<null>('/api/documents', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  },
};

export const notificationService = {
  list() {
    return apiRequest<Array<{
      id: string;
      title: string;
      description: string;
      type: 'error' | 'warning' | 'success' | 'info';
      date: string;
    }>>('/api/notifications');
  },

  clearAll() {
    return apiRequest<null>('/api/notifications', {
      method: 'PATCH',
    });
  },
};

export const teamService = {
  invite(input: { name: string; email: string; role: string }) {
    return apiRequest<any>('/api/team-invites', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

export const storageService = {
  async createUploadUrl(input: { bucket: string; fileName: string; recordId?: string }) {
    return apiRequest<{
      bucket: string;
      path: string;
      signedUrl: string;
      token: string;
    }>('/api/storage', {
      method: 'POST',
      body: JSON.stringify({ ...input, action: 'upload-url' }),
    });
  },

  async uploadWithSignedUrl(input: { bucket: string; path: string; token: string; file: File }) {
    const { error } = await supabase.storage
      .from(input.bucket)
      .uploadToSignedUrl(input.path, input.token, input.file);
    if (error) throw error;
  },

  createDownloadUrl(input: { bucket: string; path: string; fileName?: string }) {
    return apiRequest<{
      bucket: string;
      path: string;
      fileName: string;
      signedUrl: string;
      expiresIn: number;
    }>('/api/storage', {
      method: 'POST',
      body: JSON.stringify({ ...input, action: 'download-url' }),
    });
  },
};
