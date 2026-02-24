const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.handleTokenExpired();
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private handleTokenExpired() {
    // Clear token and user data
    this.removeToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      // Redirect to login page
      window.location.href = '/';
    }
  }

  // Authentication methods
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(email: string, password: string, role: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async verifyToken(token: string) {
    return this.request('/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // User methods
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: { name?: string; organization?: string }) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Project methods
  async getProjects() {
    return this.request('/projects');
  }

  async createProject(projectData: {
    name: string;
    description: string;
    location: string;
    totalBudget: number;
    contractor: string;
  }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async allocateFunds(projectId: string, amount: number) {
    return this.request(`/projects/${projectId}/allocate`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  }

  async approvePayment(projectId: string, milestoneId: string) {
    return this.request(`/projects/${projectId}/approve-payment`, {
      method: 'PUT',
      body: JSON.stringify({ milestoneId }),
    });
  }

  async submitMilestone(projectId: string, milestoneData: {
    name: string;
    description: string;
    amount: number;
  }) {
    return this.request(`/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  }

  async getProjectTransactions(projectId: string) {
    return this.request(`/projects/${projectId}/transactions`);
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
  }

  getToken() {
    return this.token;
  }

  isTokenValid(): boolean {
    return !!this.token;
  }

  async logout() {
    try {
      // Call logout endpoint if needed (optional)
      // await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local data
      this.removeToken();
    }
  }
}

export const apiService = new ApiService();
export default apiService;
