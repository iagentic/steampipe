# Steampipe UI

A modern web interface for the Steampipe REST API built with Next.js and PrimeReact.

## Features

- **Health Monitoring**: Real-time system health status
- **SQL Query Execution**: Execute SQL queries with results displayed in a data table
- **Service Management**: Start, stop, and monitor the Steampipe database service
- **Plugin Management**: Install, uninstall, and manage Steampipe plugins
- **Modern UI**: Built with PrimeReact components for a professional look and feel

## Prerequisites

- Node.js 18+ 
- Steampipe REST API server running on `http://localhost:8080`
- Steampipe database service running (`steampipe service start`)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### Health Tab
- View system health status, version, and last updated timestamp
- Refresh health status manually

### Query Tab
- Enter SQL queries in the input field
- Execute queries and view results in a paginated data table
- See query execution time and row count

### Service Tab
- View current service status (running/stopped)
- Start or stop the Steampipe database service
- Monitor service details (port, host, database, uptime, connections)

### Plugins Tab
- View all installed plugins with their versions and status
- Install new plugins by entering the plugin name
- Uninstall existing plugins

## API Endpoints

The UI communicates with the following Steampipe REST API endpoints:

- `GET /health` - Health check
- `POST /api/v1/query` - Execute SQL query
- `POST /api/v1/query/batch` - Execute batch queries
- `GET /api/v1/service/status` - Get service status
- `POST /api/v1/service/start` - Start service
- `POST /api/v1/service/stop` - Stop service
- `POST /api/v1/service/restart` - Restart service
- `GET /api/v1/plugins` - List plugins
- `POST /api/v1/plugins/install` - Install plugin
- `DELETE /api/v1/plugins/uninstall` - Uninstall plugin
- `PUT /api/v1/plugins/update` - Update plugin

## Development

### Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with PrimeReact CSS
│   └── page.tsx            # Main dashboard component
├── lib/
│   ├── api.ts              # API client configuration
│   └── api-client/         # Generated API client (from OpenAPI)
└── ...
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **PrimeReact** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **OpenAPI Generator** - API client generation

## Troubleshooting

### API Connection Issues
- Ensure the Steampipe REST API server is running on the correct port
- Check that the `NEXT_PUBLIC_API_BASE_URL` environment variable is set correctly
- Verify that the Steampipe database service is running (`steampipe service start`)

### Build Issues
- Clear the `.next` directory and reinstall dependencies
- Ensure all TypeScript types are properly installed

### UI Issues
- Check browser console for JavaScript errors
- Verify that PrimeReact CSS is properly imported in the layout

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License.
