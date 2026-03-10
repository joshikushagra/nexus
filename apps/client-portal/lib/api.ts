const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ClientCreatePayload = {
  name: string;
  company?: string;
  email?: string;
  status: string;
  tags?: string[];
};

type WorkCreatePayload = {
  title: string;
  description: string;
  budget: number;
  timeline: string;
  skillsRequired: string[];
};

async function request(path: string, options: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }

  return response.json();
}

// Temporary Mock login returning a fake Firebase token
export async function login(email: string, password: string): Promise<string> {
  return "mock-jwt-token";
}

// Map the backend /users (which might act as clients in this UI context)
export async function fetchClients(token: string) {
  return request("/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Create user/client
export async function createClient(token: string, payload: ClientCreatePayload) {
  return request("/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, role: "client" }),
  });
}

// Current User Profile logic
export async function getCurrentUser(token: string) {
  return request("/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Work (ClientRequirements) endpoints
export async function fetchWork(token: string) {
  return request("/client-requirements", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createWork(token: string, payload: WorkCreatePayload) {
  return request("/client-requirements", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
