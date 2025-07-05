# DevOps Admin Dashboard

A modern admin dashboard for DevOps operations and monitoring, built with Next.js and PrimeReact.

## Features

### 🏠 **Admin Dashboard Overview**
- **System Health**: Real-time API health monitoring with status indicators
- **Service Management**: Start, stop, and restart DevOps services
- **Plugin Management**: View installed plugins with status and connections
- **Quick Actions**: Easy access to common operations
- **Responsive Design**: Works on desktop and mobile devices

### 📊 **Dynamic Dashboards**
- **Dashboard List**: Grid and list view with search and tag filtering
- **CRUD Operations**: Create, read, update, and delete dashboards
- **Tag Management**: Organize dashboards with custom tags
- **Query Execution**: Run SQL queries directly from dashboards
- **Results Display**: Interactive data tables with sorting and filtering

### 🎨 **Modern Admin Interface**
- **Sidebar Navigation**: Collapsible sidebar with menu items
- **Theme Support**: Light and dark theme with smooth transitions
- **User Profile**: Admin user information display
- **Breadcrumb Navigation**: Clear page hierarchy
- **Professional UI**: Modern admin dashboard design

### 🔧 **API Integration**
- **REST API Client**: Full integration with DevOps REST API
- **Service Control**: Manage DevOps database service
- **Plugin Operations**: Install, uninstall, and update plugins
- **Query Execution**: Execute single and batch SQL queries
- **Error Handling**: Comprehensive error handling and user feedback

## Prerequisites

1. **DevOps REST API Server**: Must be running on `http://localhost:8080`
2. **Node.js**: Version 18 or higher
3. **DevOps Service**: Should be running (`steampipe service start`)

## Installation

1. **Install Dependencies**:
   ```bash
   cd steampipe-ui
   npm install
   ```

2. **Configure API URL** (optional):
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:3000`

## Usage

### Admin Dashboard Navigation
- **Sidebar**: Use the collapsible sidebar to navigate between sections
- **Theme Toggle**: Click the sun/moon icon to switch between light and dark themes
- **User Menu**: View admin user information in the top-right corner
- **Breadcrumbs**: See current page location in the header

### Dashboard Overview
- View system health and service status
- Manage DevOps service (start/stop/restart)
- Monitor installed plugins
- Access quick actions

### Managing Dashboards
1. **Create Dashboard**:
   - Navigate to "Dashboards" in the sidebar
   - Click "Add Dashboard" button
   - Fill in name, description, tags, and SQL query
   - Click "Create"

2. **Edit Dashboard**:
   - Click "Edit" button on any dashboard card
   - Modify fields as needed
   - Click "Update"

3. **Delete Dashboard**:
   - Click "Delete" button on any dashboard card
   - Confirm deletion in the dialog

4. **Filter and Search**:
   - Use the search box to find dashboards by name
   - Use tag filter to show dashboards with specific tags
   - Toggle between grid and list view

### Running Queries
1. Navigate to a dashboard detail page
2. Review the SQL query
3. Click "Run Query" to execute
4. View results in the interactive data table
5. Use sorting and filtering on result columns

## API Endpoints

The UI integrates with the following DevOps REST API endpoints:

- `GET /health` - Health check
- `GET /api/v1/service/status` - Service status
- `POST /api/v1/service/start` - Start service
- `POST /api/v1/service/stop` - Stop service
- `POST /api/v1/service/restart` - Restart service
- `GET /api/v1/plugins` - List plugins
- `POST /api/v1/plugins/install` - Install plugin
- `DELETE /api/v1/plugins/uninstall` - Uninstall plugin
- `PUT /api/v1/plugins/update` - Update plugin
- `POST /api/v1/query` - Execute query
- `POST /api/v1/query/batch` - Execute batch queries

## Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── dashboards/        # Dashboard pages
│   │   ├── page.tsx       # Dashboard list
│   │   └── [id]/          # Dashboard detail
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── Navigation.tsx     # Admin sidebar and header
│   └── ThemeProvider.tsx  # Theme management
└── lib/                   # Utilities
    └── api.ts             # API client
```

### Key Technologies
- **Next.js 14**: React framework with app router
- **PrimeReact**: UI component library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

### Building for Production
```bash
npm run build
npm start
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the DevOps API server is configured with CORS headers.

### Service Not Running
If the service status shows as unavailable:
1. Check if DevOps is installed
2. Run `steampipe service start`
3. Verify the service is running on the expected port

### API Connection Issues
1. Verify the API server is running on the correct URL
2. Check the `NEXT_PUBLIC_API_URL` environment variable
3. Ensure no firewall is blocking the connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License.
