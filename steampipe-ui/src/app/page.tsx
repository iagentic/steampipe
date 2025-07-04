'use client'

import React, { useState, useEffect } from 'react'
import { Card } from 'primereact/card'
import { TabView, TabPanel } from 'primereact/tabview'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toast } from 'primereact/toast'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { apiClient } from '@/lib/api'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<any>(null)
  
  // Health state
  const [healthStatus, setHealthStatus] = useState<any>(null)
  
  // Query state
  const [sqlQuery, setSqlQuery] = useState('SELECT 1 as test')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  
  // Service state
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  const [serviceLoading, setServiceLoading] = useState(false)
  
  // Plugin state
  const [plugins, setPlugins] = useState<any[]>([])
  const [pluginsLoading, setPluginsLoading] = useState(false)
  const [newPluginName, setNewPluginName] = useState('')

  // Load initial data
  useEffect(() => {
    loadHealthStatus()
    loadServiceStatus()
    loadPlugins()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
    if (toast) {
      toast.show({ severity, summary, detail })
    }
  }

  const loadHealthStatus = async () => {
    try {
      setLoading(true)
      const health = await apiClient.getHealth()
      setHealthStatus(health)
    } catch (error: any) {
      console.error('Health status error:', error)
      showToast('error', 'Error', `Failed to load health status: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadServiceStatus = async () => {
    try {
      setServiceLoading(true)
      const status = await apiClient.getServiceStatus()
      setServiceStatus(status)
    } catch (error: any) {
      showToast('error', 'Error', `Failed to load service status: ${error.message}`)
    } finally {
      setServiceLoading(false)
    }
  }

  const loadPlugins = async () => {
    try {
      setPluginsLoading(true)
      const response: any = await apiClient.listPlugins()
      setPlugins(response.plugins || [])
    } catch (error: any) {
      showToast('error', 'Error', `Failed to load plugins: ${error.message}`)
    } finally {
      setPluginsLoading(false)
    }
  }

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      showToast('warn', 'Warning', 'Please enter a SQL query')
      return
    }

    try {
      setQueryLoading(true)
      const result = await apiClient.executeQuery(sqlQuery)
      setQueryResult(result)
      showToast('success', 'Success', 'Query executed successfully')
    } catch (error: any) {
      showToast('error', 'Error', `Query failed: ${error.message}`)
    } finally {
      setQueryLoading(false)
    }
  }

  const startService = async () => {
    try {
      setServiceLoading(true)
      await apiClient.startService()
      showToast('success', 'Success', 'Service started successfully')
      await loadServiceStatus()
    } catch (error: any) {
      showToast('error', 'Error', `Failed to start service: ${error.message}`)
    } finally {
      setServiceLoading(false)
    }
  }

  const stopService = async () => {
    try {
      setServiceLoading(true)
      await apiClient.stopService()
      showToast('success', 'Success', 'Service stopped successfully')
      await loadServiceStatus()
    } catch (error: any) {
      showToast('error', 'Error', `Failed to stop service: ${error.message}`)
    } finally {
      setServiceLoading(false)
    }
  }

  const installPlugin = async () => {
    if (!newPluginName.trim()) {
      showToast('warn', 'Warning', 'Please enter a plugin name')
      return
    }

    try {
      setPluginsLoading(true)
      await apiClient.installPlugin(newPluginName)
      showToast('success', 'Success', 'Plugin installed successfully')
      setNewPluginName('')
      await loadPlugins()
    } catch (error: any) {
      showToast('error', 'Error', `Failed to install plugin: ${error.message}`)
    } finally {
      setPluginsLoading(false)
    }
  }

  const uninstallPlugin = async (pluginName: string) => {
    try {
      setPluginsLoading(true)
      await apiClient.uninstallPlugin(pluginName)
      showToast('success', 'Success', 'Plugin uninstalled successfully')
      await loadPlugins()
    } catch (error: any) {
      showToast('error', 'Error', `Failed to uninstall plugin: ${error.message}`)
    } finally {
      setPluginsLoading(false)
    }
  }

  const getStatusSeverity = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running': return 'success'
      case 'stopped': return 'danger'
      case 'starting': return 'warning'
      case 'stopping': return 'warning'
      default: return 'info'
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-4">
        <Toast ref={setToast} />
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Steampipe UI</h1>
            <p className="text-gray-600">Web interface for Steampipe REST API</p>
          </div>

          <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
            
            {/* Health Tab */}
            <TabPanel header="Health">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">System Health</h2>
                  <Button 
                    icon="pi pi-refresh" 
                    onClick={loadHealthStatus}
                    loading={loading}
                    label="Refresh"
                  />
                </div>
                
                {healthStatus ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="text-center">
                      <div className="text-2xl font-bold text-green-600">{healthStatus.status}</div>
                      <div className="text-gray-600">Status</div>
                    </Card>
                    <Card className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{healthStatus.version}</div>
                      <div className="text-gray-600">Version</div>
                    </Card>
                    <Card className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Date(healthStatus.timestamp).toLocaleString()}
                      </div>
                      <div className="text-gray-600">Last Updated</div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ProgressSpinner />
                    <p className="mt-4 text-gray-600">Loading health status...</p>
                  </div>
                )}
              </Card>
            </TabPanel>

            {/* Query Tab */}
            <TabPanel header="Query">
              <Card>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-4">SQL Query Execution</h2>
                  <div className="flex gap-2 mb-4">
                    <InputText
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      placeholder="Enter SQL query..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
                    />
                    <Button 
                      icon="pi pi-play" 
                      onClick={executeQuery}
                      loading={queryLoading}
                      label="Execute"
                    />
                  </div>
                </div>

                {queryResult && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Query Results</h3>
                    {queryResult.success ? (
                      <div>
                        <div className="mb-4">
                          <Tag 
                            value={`${queryResult.row_count} rows`} 
                            severity="info" 
                            className="mr-2"
                          />
                          <Tag 
                            value={`${queryResult.timing?.duration_ms}ms`} 
                            severity="success"
                          />
                        </div>
                        
                        {queryResult.data && queryResult.data.length > 0 && (
                          <DataTable 
                            value={queryResult.data} 
                            paginator 
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            className="mt-4"
                          >
                            {queryResult.columns?.map((column: string) => (
                              <Column 
                                key={column} 
                                field={column} 
                                header={column}
                                sortable
                              />
                            ))}
                          </DataTable>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800">{queryResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </TabPanel>

            {/* Service Management Tab */}
            <TabPanel header="Service">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Service Management</h2>
                  <Button 
                    icon="pi pi-refresh" 
                    onClick={loadServiceStatus}
                    loading={serviceLoading}
                    label="Refresh"
                  />
                </div>

                {serviceStatus ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Tag 
                            value={serviceStatus.status} 
                            severity={getStatusSeverity(serviceStatus.status)}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Port:</span>
                          <span>{serviceStatus.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Host:</span>
                          <span>{serviceStatus.host}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Database:</span>
                          <span>{serviceStatus.database}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Uptime:</span>
                          <span>{serviceStatus.uptime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Connections:</span>
                          <span>{serviceStatus.connections}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Actions</h3>
                      <div className="space-y-3">
                        <Button 
                          icon="pi pi-play" 
                          label="Start Service"
                          onClick={startService}
                          loading={serviceLoading}
                          className="w-full"
                          severity="success"
                        />
                        <Button 
                          icon="pi pi-stop" 
                          label="Stop Service"
                          onClick={stopService}
                          loading={serviceLoading}
                          className="w-full"
                          severity="danger"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ProgressSpinner />
                    <p className="mt-4 text-gray-600">Loading service status...</p>
                  </div>
                )}
              </Card>
            </TabPanel>

            {/* Plugin Management Tab */}
            <TabPanel header="Plugins">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Plugin Management</h2>
                  <Button 
                    icon="pi pi-refresh" 
                    onClick={loadPlugins}
                    loading={pluginsLoading}
                    label="Refresh"
                  />
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Install New Plugin</h3>
                  <div className="flex gap-2">
                    <InputText
                      value={newPluginName}
                      onChange={(e) => setNewPluginName(e.target.value)}
                      placeholder="Plugin name (e.g., hub.steampipe.io/plugins/turbot/aws@latest)"
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && installPlugin()}
                    />
                    <Button 
                      icon="pi pi-plus" 
                      onClick={installPlugin}
                      loading={pluginsLoading}
                      label="Install"
                      severity="success"
                    />
                  </div>
        </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Installed Plugins</h3>
                  {plugins.length > 0 ? (
                    <DataTable 
                      value={plugins} 
                      paginator 
                      rows={10}
                      rowsPerPageOptions={[5, 10, 25]}
                    >
                      <Column field="name" header="Name" sortable />
                      <Column field="version" header="Version" sortable />
                      <Column 
                        field="status" 
                        header="Status" 
                        body={(rowData) => (
                          <Tag 
                            value={rowData.status} 
                            severity={rowData.status === 'installed' ? 'success' : 'warning'}
                          />
                        )}
                      />
                      <Column 
                        header="Actions" 
                        body={(rowData) => (
                          <Button 
                            icon="pi pi-trash" 
                            severity="danger"
                            size="small"
                            onClick={() => uninstallPlugin(rowData.name)}
                            loading={pluginsLoading}
                          />
                        )}
                      />
                    </DataTable>
                  ) : (
                    <div className="text-center py-8 text-gray-600">
                      No plugins installed
                    </div>
                  )}
                </div>
              </Card>
            </TabPanel>

          </TabView>
        </div>
    </div>
    </ErrorBoundary>
  )
}
