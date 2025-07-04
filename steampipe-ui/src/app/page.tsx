'use client'

import React, { useEffect, useState } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProgressSpinner } from 'primereact/progressspinner'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function HomePage() {
  const [health, setHealth] = useState<any>(null)
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  const [plugins, setPlugins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [healthData, serviceData, pluginsData] = await Promise.all([
        apiClient.getHealth().catch(() => null),
        apiClient.getServiceStatus().catch(() => null),
        apiClient.listPlugins().catch(() => ({ plugins: [] }))
      ])
      
      setHealth(healthData)
      setServiceStatus(serviceData)
      setPlugins(pluginsData.plugins || [])
    } catch (error: any) {
      toast?.show({ severity: 'error', summary: 'Error', detail: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleServiceAction = async (action: 'start' | 'stop' | 'restart') => {
    try {
      if (action === 'start') {
        await apiClient.startService()
      } else if (action === 'stop') {
        await apiClient.stopService()
      } else if (action === 'restart') {
        await apiClient.restartService()
      }
      
      toast?.show({ severity: 'success', summary: 'Success', detail: `Service ${action}ed successfully` })
      loadData() // Refresh data
    } catch (error: any) {
      toast?.show({ severity: 'error', summary: 'Error', detail: error.message })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    )
  }

  return (
    <main className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Toast ref={setToast} />
      
      <div className="mb-6">
        <Link href="/dashboards">
          <button className="p-button p-component p-button-lg p-button-primary">View Dashboards</button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Steampipe UI</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your Steampipe service, plugins, and dashboards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Health Status */}
        <Card title="Health Status" className="h-fit">
          {health ? (
            <div className="text-center">
              <div className="text-green-600 text-2xl mb-2">✓</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">API is healthy</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Version: {health.version}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-red-600 text-2xl mb-2">✗</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">API is unavailable</p>
            </div>
          )}
        </Card>

        {/* Service Status */}
        <Card title="Service Status" className="h-fit">
          {serviceStatus ? (
            <div>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${serviceStatus.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">{serviceStatus.status}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Port: {serviceStatus.port} | Uptime: {serviceStatus.uptime}
              </p>
              <div className="flex gap-2">
                {serviceStatus.status !== 'running' && (
                  <Button label="Start" size="small" onClick={() => handleServiceAction('start')} />
                )}
                {serviceStatus.status === 'running' && (
                  <>
                    <Button label="Stop" size="small" severity="danger" onClick={() => handleServiceAction('stop')} />
                    <Button label="Restart" size="small" severity="secondary" onClick={() => handleServiceAction('restart')} />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Service status unavailable</p>
              <Button label="Start Service" size="small" onClick={() => handleServiceAction('start')} />
            </div>
          )}
        </Card>

        {/* Plugins Summary */}
        <Card title="Plugins" className="h-fit">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{plugins.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Installed plugins</p>
          </div>
        </Card>
      </div>

      {/* Plugins Table */}
      {plugins.length > 0 && (
        <Card title="Installed Plugins" className="mb-8">
          <DataTable value={plugins} paginator rows={5} className="mt-4">
            <Column field="name" header="Name" sortable />
            <Column field="version" header="Version" sortable />
            <Column field="status" header="Status" sortable />
            <Column 
              field="connections" 
              header="Connections" 
              body={(rowData) => rowData.connections?.join(', ') || '-'}
            />
          </DataTable>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-4">
          <Button 
            label="Refresh Data" 
            icon="pi pi-refresh"
            onClick={loadData}
          />
          <Button 
            label="View Dashboards" 
            icon="pi pi-table"
            onClick={() => window.location.href = '/dashboards'}
          />
        </div>
      </Card>
    </main>
  )
}
