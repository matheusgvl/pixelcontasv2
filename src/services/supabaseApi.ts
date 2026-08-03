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
    throw new Error(payload.error || 'Erro ao comunicar com a API.');
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

export const databaseService = {
  list<T>(table: string, query = '') {
    return apiRequest<T[]>(`/api/db/${table}${query}`);
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
