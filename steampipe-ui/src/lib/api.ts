// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// API Client class
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<T>
  }

  // Health API
  async getHealth() {
    return this.request('/health')
  }

  // Query API
  async executeQuery(sql: string) {
    return this.request('/api/v1/query', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    })
  }

  async executeBatchQueries(queries: string[]) {
    return this.request('/api/v1/query/batch', {
      method: 'POST',
      body: JSON.stringify({ queries }),
    })
  }

  // Service Management API
  async getServiceStatus() {
    return this.request('/api/v1/service/status')
  }

  async startService(port?: number, listenAddresses?: string) {
    const params = new URLSearchParams()
    if (port) params.append('port', port.toString())
    if (listenAddresses) params.append('listen_addresses', listenAddresses)
    
    return this.request(`/api/v1/service/start?${params.toString()}`, {
      method: 'POST',
    })
  }

  async stopService(force?: boolean) {
    const params = new URLSearchParams()
    if (force) params.append('force', force.toString())
    
    return this.request(`/api/v1/service/stop?${params.toString()}`, {
      method: 'POST',
    })
  }

  async restartService(port?: number, listenAddresses?: string) {
    const params = new URLSearchParams()
    if (port) params.append('port', port.toString())
    if (listenAddresses) params.append('listen_addresses', listenAddresses)
    
    return this.request(`/api/v1/service/restart?${params.toString()}`, {
      method: 'POST',
    })
  }

  // Plugin Management API
  async listPlugins() {
    return this.request('/api/v1/plugins')
  }

  async installPlugin(name: string, version?: string) {
    return this.request('/api/v1/plugins/install', {
      method: 'POST',
      body: JSON.stringify({ name, version }),
    })
  }

  async uninstallPlugin(name: string) {
    return this.request(`/api/v1/plugins/uninstall?name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
  }

  async updatePlugin(name: string, version?: string) {
    return this.request('/api/v1/plugins/update', {
      method: 'PUT',
      body: JSON.stringify({ name, version }),
    })
  }

  // Documentation API
  async getApiDocs() {
    return this.request('/api/v1/docs')
  }
}

// Real Steampipe API client
export const apiClient = {
  // Query execution
  async executeQuery(sql: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }
    return response.json();
  },

  async executeBatchQueries(queries: string[]) {
    const response = await fetch(`${API_BASE_URL}/api/v1/query/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries }),
    });
    if (!response.ok) {
      throw new Error(`Batch query failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Service management
  async getServiceStatus() {
    const response = await fetch(`${API_BASE_URL}/api/v1/service/status`);
    if (!response.ok) {
      throw new Error(`Failed to get service status: ${response.statusText}`);
    }
    return response.json();
  },

  async startService(port?: number, listenAddresses?: string) {
    const params = new URLSearchParams();
    if (port) params.append('port', port.toString());
    if (listenAddresses) params.append('listen_addresses', listenAddresses);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service/start?${params}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to start service: ${response.statusText}`);
    }
    return response.json();
  },

  async stopService(force?: boolean) {
    const params = new URLSearchParams();
    if (force) params.append('force', force.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service/stop?${params}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to stop service: ${response.statusText}`);
    }
    return response.json();
  },

  async restartService(port?: number, listenAddresses?: string) {
    const params = new URLSearchParams();
    if (port) params.append('port', port.toString());
    if (listenAddresses) params.append('listen_addresses', listenAddresses);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/service/restart?${params}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to restart service: ${response.statusText}`);
    }
    return response.json();
  },

  // Plugin management
  async listPlugins() {
    const response = await fetch(`${API_BASE_URL}/api/v1/plugins`);
    if (!response.ok) {
      throw new Error(`Failed to list plugins: ${response.statusText}`);
    }
    return response.json();
  },

  async installPlugin(name: string, version?: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/plugins/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, version }),
    });
    if (!response.ok) {
      throw new Error(`Failed to install plugin: ${response.statusText}`);
    }
    return response.json();
  },

  async uninstallPlugin(name: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/plugins/uninstall?name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to uninstall plugin: ${response.statusText}`);
    }
    return response.json();
  },

  async updatePlugin(name: string, version?: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/plugins/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, version }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update plugin: ${response.statusText}`);
    }
    return response.json();
  },

  // Health check
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Dashboard management (placeholder - would need backend implementation)
  async getDashboards() {
    // TODO: Implement when backend supports dashboard storage
    return [
      { id: 1, name: 'AWS Inventory', tags: ['aws', 'inventory'], description: 'All AWS resources' },
      { id: 2, name: 'Azure Security', tags: ['azure', 'security'], description: 'Azure security posture' },
      { id: 3, name: 'Kubernetes Clusters', tags: ['k8s', 'inventory'], description: 'K8s clusters overview' },
    ];
  },

  async getDashboard(id: string | number) {
    // TODO: Implement when backend supports dashboard storage
    return { 
      id, 
      name: 'AWS Inventory', 
      tags: ['aws', 'inventory'], 
      description: 'All AWS resources', 
      sql: 'select * from aws_vpc limit 5' 
    };
  },

  async createDashboard(dashboard: any) {
    // TODO: Implement when backend supports dashboard storage
    return { success: true, dashboard };
  },

  async updateDashboard(id: string | number, dashboard: any) {
    // TODO: Implement when backend supports dashboard storage
    return { success: true, dashboard };
  },

  async deleteDashboard(id: string | number) {
    // TODO: Implement when backend supports dashboard storage
    return { success: true };
  },
}; 