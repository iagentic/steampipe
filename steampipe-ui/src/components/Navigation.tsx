'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from 'primereact/button';
import { useTheme } from './ThemeProvider';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      path: '/',
      badge: null
    },
    {
      label: 'Dashboards',
      icon: 'pi pi-table',
      path: '/dashboards',
      badge: null
    },
    {
      label: 'Services',
      icon: 'pi pi-server',
      path: '/services',
      badge: null
    },
    {
      label: 'Plugins',
      icon: 'pi pi-puzzle-piece',
      path: '/plugins',
      badge: null
    },
    {
      label: 'Queries',
      icon: 'pi pi-database',
      path: '/queries',
      badge: null
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="pi pi-cloud text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">DevOps</span>
            </Link>
          )}
          <Button
            icon={sidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-button-text p-button-rounded"
            tooltip={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          />
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2 mb-1 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <i className={`${item.icon} mr-3 ${sidebarCollapsed ? 'mx-auto' : ''}`}></i>
              {!sidebarCollapsed && (
                <span className="flex-1">{item.label}</span>
              )}
              {item.badge && !sidebarCollapsed && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </div>
            )}
            <Button
              icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
              onClick={toggleTheme}
              className="p-button-text p-button-rounded"
              tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            />
          </div>
        </div>
      </div>

      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <i className="pi pi-user text-gray-600 dark:text-gray-300"></i>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
} 