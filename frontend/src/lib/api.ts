const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── HTTP Helper ──────────────────────────────────────────────────────────────

async function request<T = any>(
  method: string,
  path: string,
  body?: any,
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return {} as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error ||
      data?.detail ||
      data?.message ||
      Object.values(data).flat().join(' ') ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(credentials: { username: string; password: string }) {
  return request<{ token: string; refresh: string; user: { id: string; username: string; role: string } }>(
    'POST', '/auth/login/', credentials, false
  );
}

export async function register(credentials: { username: string; password: string }) {
  return request('POST', '/auth/register/', credentials, false);
}

// ─── Trucks ───────────────────────────────────────────────────────────────────

export interface TruckData {
  id: string;
  registrationNumber: string;
  capacity: number;
  status: 'Available' | 'In Transit' | 'Maintenance';
  createdAt: string;
}

export async function fetchTrucks(page = 1, pageSize = 10, search = '') {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search) params.set('search', search);
  return request<{ items: TruckData[]; total: number }>('GET', `/trucks/?${params}`);
}

export async function createTruck(data: { registrationNumber: string; capacity: number; status: string }) {
  return request('POST', '/trucks/', {
    registration_number: data.registrationNumber,
    capacity: data.capacity,
    status: data.status,
  });
}

export async function updateTruck(id: string, data: { registrationNumber: string; capacity: number; status: string }) {
  return request('PATCH', `/trucks/${id}/`, {
    registration_number: data.registrationNumber,
    capacity: data.capacity,
    status: data.status,
  });
}

export async function deleteTruck(id: string) {
  return request('DELETE', `/trucks/${id}/`);
}

// ─── Drivers ──────────────────────────────────────────────────────────────────

export interface DriverData {
  id: string;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  createdAt: string;
}

export async function fetchDrivers(page = 1, pageSize = 10, search = '') {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search) params.set('search', search);
  return request<{ items: DriverData[]; total: number }>('GET', `/drivers/?${params}`);
}

export async function createDriver(data: { name: string; licenseNumber: string; phoneNumber: string }) {
  return request('POST', '/drivers/', {
    name: data.name,
    license_number: data.licenseNumber,
    phone_number: data.phoneNumber,
  });
}

export async function updateDriver(id: string, data: { name: string; licenseNumber: string; phoneNumber: string }) {
  return request('PATCH', `/drivers/${id}/`, {
    name: data.name,
    license_number: data.licenseNumber,
    phone_number: data.phoneNumber,
  });
}

export async function deleteDriver(id: string) {
  return request('DELETE', `/drivers/${id}/`);
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export interface JobData {
  id: string;
  pickupLocation: string;
  deliveryLocation: string;
  cargoDescription: string;
  status: 'Pending' | 'In Transit' | 'Completed';
  assignedTruckId: string | null;
  assignedDriverId: string | null;
  createdAt: string;
}

export async function fetchJobs(page = 1, pageSize = 10, search = '') {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search) params.set('search', search);
  return request<{ items: JobData[]; total: number }>('GET', `/jobs/?${params}`);
}

export async function createJob(data: {
  pickupLocation: string;
  deliveryLocation: string;
  cargoDescription: string;
  truckId: string;
  driverId: string;
}) {
  return request('POST', '/jobs/', data);
}

export async function updateJob(id: string, data: {
  pickupLocation: string;
  deliveryLocation: string;
  cargoDescription: string;
  truckId: string;
  driverId: string;
}) {
  return request('PATCH', `/jobs/${id}/`, data);
}

export async function updateJobStatus(id: string, newStatus: string) {
  return request('PATCH', `/jobs/${id}/status/`, { status: newStatus });
}

export async function deleteJob(id: string) {
  return request('DELETE', `/jobs/${id}/`);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface StatsData {
  totalTrucks: number;
  availableTrucks: number;
  totalDrivers: number;
  activeJobs: number;
  completedJobs: number;
}

export async function fetchStats() {
  return request<StatsData>('GET', '/jobs/stats/');
}
