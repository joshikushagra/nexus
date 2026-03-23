const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CreateUserPayload = {
  name: string;
  email: string;
  role: string;
  bio?: string;
  skills?: string[];
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
  // In production, Firebase handles this and gives us the token.
  // We're returning a dummy token which the backend `BYPASS_AUTH` will accept for now.
  return "mock-jwt-token";
}

export async function fetchUsers(token: string) {
  return request("/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createUser(token: string, payload: CreateUserPayload) {
  return request("/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchProjects(token: string) {
  return request("/projects", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchTasks(token: string, projectId?: string) {
  const query = projectId ? `?projectId=${projectId}` : "";
  return request(`/tasks${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateTaskStatus(token: string, id: string, status: string) {
  return request(`/tasks/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export async function fetchDashboardStats(token: string) {
  return request("/dashboard/stats", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
