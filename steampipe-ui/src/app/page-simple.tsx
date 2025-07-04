'use client'

import React, { useState } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'

export default function SimpleDashboard() {
  const [toast, setToast] = useState<any>(null)
  const [sqlQuery, setSqlQuery] = useState('SELECT 1 as test')

  const showToast = (severity: string, summary: string, detail: string) => {
    if (toast) {
      toast.show({ severity, summary, detail })
    }
  }

  const executeQuery = async () => {
    try {
      showToast('info', 'Info', 'Query execution not implemented yet')
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toast ref={setToast} />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Steampipe UI</h1>
          <p className="text-gray-600">Web interface for Steampipe REST API</p>
        </div>

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
                label="Execute"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 