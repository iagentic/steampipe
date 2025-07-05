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
    <>
      <Toast ref={setToast} />
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to DevOps Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Monitor and manage your DevOps infrastructure</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Health Status */}
        <Card className="h-fit">
          <div className="text-center">
            {health ? (
              <>
                <div className="text-green-600 text-3xl mb-2">✓</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">System Healthy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">API is running</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">v{health.version}</p>
              </>
            ) : (
              <>
                <div className="text-red-600 text-3xl mb-2">✗</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">System Unavailable</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">API is down</p>
              </>
            )}
          </div>
        </Card>

        {/* Service Status */}
        <Card className="h-fit">
          <div className="text-center">
            {serviceStatus ? (
              <>
                <div className={`text-3xl mb-2 ${serviceStatus.running ? 'text-green-600' : 'text-red-600'}`}>
                  {serviceStatus.running ? '🟢' : '🔴'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 capitalize">
                  {serviceStatus.running ? 'Running' : 'Stopped'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Service Status</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Port: {serviceStatus.port ?? '-'}</p>
              </>
            ) : (
              <>
                <div className="text-gray-600 text-3xl mb-2">❓</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Unknown</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Service Status</p>
              </>
            )}
          </div>
        </Card>

        {/* Plugins Count */}
        <Card className="h-fit">
          <div className="text-center">
            <div className="text-blue-600 text-3xl mb-2">{plugins.length}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Plugins</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Installed</p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="h-fit">
          <div className="text-center">
            <div className="text-purple-600 text-3xl mb-2">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Quick Actions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage system</p>
          </div>
        </Card>
      </div>

      {/* Service Management */}
      <Card title="Service Management" className="mb-8">
        {serviceStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Status:</span>
                  <span className={`font-medium ${serviceStatus.running ? 'text-green-600' : 'text-red-600'}`}>{serviceStatus.running ? 'Running' : 'Stopped'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Port:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{serviceStatus.port ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Uptime:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{serviceStatus.uptime ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Connections:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{serviceStatus.connections ?? '-'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h4>
              <div className="space-y-3">
                {!serviceStatus.running && (
                  <Button 
                    label="Start Service" 
                    icon="pi pi-play"
                    onClick={() => handleServiceAction('start')}
                    className="w-full"
                  />
                )}
                {serviceStatus.running && (
                  <>
                    <Button 
                      label="Stop Service" 
                      icon="pi pi-stop"
                      severity="danger"
                      onClick={() => handleServiceAction('stop')}
                      className="w-full"
                    />
                    <Button 
                      label="Restart Service" 
                      icon="pi pi-refresh"
                      severity="secondary"
                      onClick={() => handleServiceAction('restart')}
                      className="w-full"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Service status unavailable</p>
            <Button 
              label="Start Service" 
              icon="pi pi-play"
              onClick={() => handleServiceAction('start')}
            />
          </div>
        )}
      </Card>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            label="Refresh Data" 
            icon="pi pi-refresh"
            onClick={loadData}
            className="h-12"
          />
          <Link href="/dashboards">
            <Button 
              label="View Dashboards" 
              icon="pi pi-table"
              className="w-full h-12"
            />
          </Link>
          <Button 
            label="Run Query" 
            icon="pi pi-database"
            className="h-12"
          />
        </div>
      </Card>
    </>
  )
}
