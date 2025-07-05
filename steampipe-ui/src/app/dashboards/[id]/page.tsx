'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { apiClient } from '@/lib/api';

interface Dashboard {
  id: string | number;
  name: string;
  description: string;
  tags: string[];
  sql?: string;
}

interface QueryResult {
  success: boolean;
  data: any[];
  columns: string[];
  row_count: number;
  timing: {
    duration_ms: number;
    rows_returned: number;
  };
  error?: string;
}

export default function DashboardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dashboardId = params.id;
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [queryLoading, setQueryLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, [dashboardId]);

  const fetchDashboard = async () => {
    if (!dashboardId) return;
    
    try {
      setLoading(true);
      const id = Array.isArray(dashboardId) ? dashboardId[0] : dashboardId;
      const data = await apiClient.getDashboard(id);
      setDashboard(data);
    } catch (error: any) {
      toast?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Failed to load dashboard: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const runQuery = async () => {
    if (!dashboard?.sql) {
      toast?.show({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'No SQL query defined for this dashboard' 
      });
      return;
    }
    
    try {
      setQueryLoading(true);
      const result = await apiClient.executeQuery(dashboard.sql);
      setQueryResult(result);
      
      if (result.success) {
        toast?.show({ 
          severity: 'success', 
          summary: 'Query Success', 
          detail: `Query executed in ${result.timing?.duration_ms}ms, returned ${result.row_count} rows` 
        });
      } else {
        toast?.show({ 
          severity: 'error', 
          summary: 'Query Error', 
          detail: result.error || 'Query failed' 
        });
      }
    } catch (error: any) {
      toast?.show({ 
        severity: 'error', 
        summary: 'Query Error', 
        detail: error.message 
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const goBack = () => {
    router.push('/dashboards');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        <Toast ref={setToast} />
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Dashboard Not Found</h2>
            <Button label="Go Back" onClick={goBack} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toast ref={setToast} />
      
      {/* Page Header */}
      <div className="mb-6">
        <Button 
          label="Back to Dashboards" 
          icon="pi pi-arrow-left"
          onClick={goBack}
          className="mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Details</h1>
        <p className="text-gray-600 dark:text-gray-300">Execute queries and view results</p>
      </div>

      {/* Dashboard Info */}
      <Card 
        title={dashboard.name} 
        subTitle={dashboard.tags?.join(', ')}
        className="mb-6"
      >
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300">{dashboard.description}</p>
        </div>
        
        {dashboard.sql && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">SQL Query</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm text-gray-900 dark:text-gray-100">
              {dashboard.sql}
            </div>
          </div>
        )}
        
        <Button 
          label="Run Query" 
          icon="pi pi-play"
          onClick={runQuery} 
          loading={queryLoading}
          disabled={!dashboard.sql}
        />
      </Card>

      {/* Query Results */}
      {queryResult && (
        <Card title="Query Results" className="mb-6">
          {queryResult.success ? (
            <div>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                <span>Rows: {queryResult.row_count}</span>
                {queryResult.timing && (
                  <span className="ml-4">Duration: {queryResult.timing.duration_ms}ms</span>
                )}
              </div>
              
              {queryResult.data && queryResult.data.length > 0 ? (
                <DataTable 
                  value={queryResult.data} 
                  paginator 
                  rows={10} 
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  className="mt-4"
                  scrollable
                  scrollHeight="400px"
                >
                  {queryResult.columns?.map((col: string) => (
                    <Column 
                      key={col} 
                      field={col} 
                      header={col} 
                      sortable 
                      filter
                      showFilterMenu={false}
                    />
                  ))}
                </DataTable>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data returned
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-red-800 dark:text-red-200 font-mono text-sm">{queryResult.error}</p>
            </div>
          )}
        </Card>
      )}
    </>
  );
} 