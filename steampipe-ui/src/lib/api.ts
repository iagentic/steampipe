// API Configuration
const API_BASE_URL = typeof window !== 'undefined' 
  ? (window as any).__NEXT_DATA__?.props?.apiBaseUrl || 'http://localhost:8080'
  : 'http://localhost:8080'

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

// Export default instance
export const apiClient = new ApiClient() 