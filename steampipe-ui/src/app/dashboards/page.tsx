'use client';

import React, { useEffect, useState } from 'react';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Chips } from 'primereact/chips';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { apiClient } from '@/lib/api';

interface Dashboard {
  id?: number;
  name: string;
  description: string;
  tags: string[];
  sql?: string;
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [filtered, setFiltered] = useState<Dashboard[]>([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState<any>(null);
  
  // CRUD state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [formData, setFormData] = useState<Dashboard>({
    name: '',
    description: '',
    tags: [],
    sql: ''
  });

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const data = await apiClient.getDashboards();
      setDashboards(data);
      setFiltered(data);
      setTags(Array.from(new Set(data.flatMap(d => d.tags || []))));
    } catch (error: any) {
      toast?.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  useEffect(() => {
    let result = dashboards;
    if (search) {
      result = result.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedTags.length > 0) {
      result = result.filter(d => d.tags?.some((tag: string) => selectedTags.includes(tag)));
    }
    setFiltered(result);
  }, [search, selectedTags, dashboards]);

  const handleCreate = () => {
    setFormData({ name: '', description: '', tags: [], sql: '' });
    setShowCreateModal(true);
  };

  const handleEdit = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard);
    setFormData({ ...dashboard });
    setShowEditModal(true);
  };

  const handleDelete = (dashboard: Dashboard) => {
    confirmDialog({
      message: `Are you sure you want to delete "${dashboard.name}"?`,
      header: 'Delete Dashboard',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteDashboard(dashboard.id!),
    });
  };

  const createDashboard = async () => {
    try {
      await apiClient.createDashboard(formData);
      toast?.show({ severity: 'success', summary: 'Success', detail: 'Dashboard created successfully' });
      setShowCreateModal(false);
      fetchDashboards();
    } catch (error: any) {
      toast?.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  const updateDashboard = async () => {
    if (!editingDashboard?.id) return;
    try {
      await apiClient.updateDashboard(editingDashboard.id, formData);
      toast?.show({ severity: 'success', summary: 'Success', detail: 'Dashboard updated successfully' });
      setShowEditModal(false);
      fetchDashboards();
    } catch (error: any) {
      toast?.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  const deleteDashboard = async (id: number) => {
    try {
      await apiClient.deleteDashboard(id);
      toast?.show({ severity: 'success', summary: 'Success', detail: 'Dashboard deleted successfully' });
      fetchDashboards();
    } catch (error: any) {
      toast?.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  const itemTemplate = (dashboard: Dashboard) => (
    <Card 
      title={dashboard.name} 
      subTitle={dashboard.tags?.join(', ')}
      className="mb-4"
    >
      <p className="mb-4">{dashboard.description}</p>
      <div className="flex gap-2">
        <Button 
          label="View" 
          icon="pi pi-eye"
          onClick={() => window.location.href = `/dashboards/${dashboard.id}`} 
        />
        <Button 
          label="Edit" 
          icon="pi pi-pencil"
          severity="secondary"
          onClick={() => handleEdit(dashboard)} 
        />
        <Button 
          label="Delete" 
          icon="pi pi-trash"
          severity="danger"
          onClick={() => handleDelete(dashboard)} 
        />
      </div>
    </Card>
  );

  const renderFooter = (isEdit: boolean = false) => (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)} className="p-button-text" />
      <Button label={isEdit ? 'Update' : 'Create'} icon="pi pi-check" onClick={isEdit ? updateDashboard : createDashboard} autoFocus />
    </div>
  );

  return (
    <>
      <Toast ref={setToast} />
      <ConfirmDialog />
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboards</h1>
        <p className="text-gray-600 dark:text-gray-300">Create and manage your custom dashboards</p>
      </div>
      
      {/* Filters and Actions */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <InputText
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dashboards..."
            className="w-64"
          />
          <MultiSelect
            value={selectedTags}
            options={tags.map(tag => ({ label: tag, value: tag }))}
            onChange={e => setSelectedTags(e.value)}
            placeholder="Filter by tag"
            className="w-64"
          />
          <DataViewLayoutOptions layout={layout} onChange={e => setLayout(e.value as 'grid' | 'list')} />
          <Button 
            label="Add Dashboard" 
            icon="pi pi-plus"
            onClick={handleCreate}
            className="ml-auto"
          />
        </div>
      </Card>
      
      {/* Dashboards Grid/List */}
      <Card>
        <DataView value={filtered} layout={layout} itemTemplate={itemTemplate} paginator rows={8} />
      </Card>

      {/* Create Modal */}
      <Dialog 
        header="Create Dashboard" 
        visible={showCreateModal} 
        style={{ width: '50vw' }} 
        footer={renderFooter(false)}
        onHide={() => setShowCreateModal(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Name</label>
            <InputText 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Description</label>
            <InputTextarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Tags</label>
            <Chips 
              value={formData.tags} 
              onChange={e => setFormData({...formData, tags: e.value || []})}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">SQL Query</label>
            <InputTextarea 
              value={formData.sql} 
              onChange={e => setFormData({...formData, sql: e.target.value})}
              rows={5}
              className="w-full"
              placeholder="SELECT * FROM aws_vpc LIMIT 10"
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog 
        header="Edit Dashboard" 
        visible={showEditModal} 
        style={{ width: '50vw' }} 
        footer={renderFooter(true)}
        onHide={() => setShowEditModal(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Name</label>
            <InputText 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Description</label>
            <InputTextarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Tags</label>
            <Chips 
              value={formData.tags} 
              onChange={e => setFormData({...formData, tags: e.value || []})}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">SQL Query</label>
            <InputTextarea 
              value={formData.sql} 
              onChange={e => setFormData({...formData, sql: e.target.value})}
              rows={5}
              className="w-full"
              placeholder="SELECT * FROM aws_vpc LIMIT 10"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
} 