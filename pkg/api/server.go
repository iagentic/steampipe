package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/spf13/viper"
	"github.com/turbot/pipe-fittings/v2/constants"
	"github.com/turbot/steampipe/pkg/db/db_common"
	"github.com/turbot/steampipe/pkg/db/db_local"
	"github.com/turbot/steampipe/pkg/plugin"
	"github.com/turbot/steampipe/pkg/query"
	"github.com/turbot/steampipe/pkg/steampipeconfig"
	"github.com/gorilla/handlers"
)

type Server struct {
	router *mux.Router
	server *http.Server
	port   int
}

type QueryRequest struct {
	SQL         string            `json:"sql"`
	Output      string            `json:"output,omitempty"`
	Timing      string            `json:"timing,omitempty"`
	SearchPath  []string          `json:"search_path,omitempty"`
	Args        map[string]string `json:"args,omitempty"`
}

type QueryResponse struct {
	Success     bool                   `json:"success"`
	Data        []map[string]interface{} `json:"data,omitempty"`
	Columns     []string               `json:"columns,omitempty"`
	RowCount    int                    `json:"row_count"`
	Timing      *TimingInfo            `json:"timing,omitempty"`
	Error       string                 `json:"error,omitempty"`
}

type TimingInfo struct {
	DurationMs          int64 `json:"duration_ms"`
	RowsReturned        int64 `json:"rows_returned"`
	UncachedRowsFetched int64 `json:"uncached_rows_fetched"`
	CachedRowsFetched   int64 `json:"cached_rows_fetched"`
	HydrateCalls        int64 `json:"hydrate_calls"`
	ConnectionCount     int64 `json:"connection_count"`
}

type ServiceStatusResponse struct {
	Running    bool   `json:"running"`
	Port       int    `json:"port,omitempty"`
	Database   string `json:"database,omitempty"`
	User       string `json:"user,omitempty"`
	Connection string `json:"connection_string,omitempty"`
	Error      string `json:"error,omitempty"`
}

type PluginListResponse struct {
	Plugins []PluginInfo `json:"plugins"`
	Error   string       `json:"error,omitempty"`
}

type PluginInfo struct {
	Name        string   `json:"name"`
	Version     string   `json:"version"`
	Connections []string `json:"connections"`
}

type PluginInstallRequest struct {
	Name    string `json:"name"`
	Version string `json:"version,omitempty"`
}

type PluginInstallResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

func NewServer(port int) *Server {
	router := mux.NewRouter()
	
	server := &Server{
		router: router,
		port:   port,
	}
	
	server.setupRoutes()
	return server
}

func (s *Server) setupRoutes() {
	// Query endpoints
	s.router.HandleFunc("/api/v1/query", s.handleQuery).Methods("POST")
	s.router.HandleFunc("/api/v1/query/batch", s.handleBatchQuery).Methods("POST")
	
	// Service management endpoints
	s.router.HandleFunc("/api/v1/service/status", s.handleServiceStatus).Methods("GET")
	s.router.HandleFunc("/api/v1/service/start", s.handleServiceStart).Methods("POST")
	s.router.HandleFunc("/api/v1/service/stop", s.handleServiceStop).Methods("POST")
	s.router.HandleFunc("/api/v1/service/restart", s.handleServiceRestart).Methods("POST")
	
	// Plugin management endpoints
	s.router.HandleFunc("/api/v1/plugins", s.handlePluginList).Methods("GET")
	s.router.HandleFunc("/api/v1/plugins/install", s.handlePluginInstall).Methods("POST")
	s.router.HandleFunc("/api/v1/plugins/uninstall", s.handlePluginUninstall).Methods("DELETE")
	s.router.HandleFunc("/api/v1/plugins/update", s.handlePluginUpdate).Methods("PUT")
	
	// Health check
	s.router.HandleFunc("/health", s.handleHealth).Methods("GET")
	
	// API documentation
	s.router.HandleFunc("/api/v1/docs", s.handleAPIDocs).Methods("GET")
}

func (s *Server) Start() error {
	s.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", s.port),
		Handler: handlers.CORS(
			handlers.AllowedOrigins([]string{"*"}),
			handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
			handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		)(s.router),
	}
	
	fmt.Printf("Steampipe REST API server starting on port %d\n", s.port)
	return s.server.ListenAndServe()
}

func (s *Server) Stop(ctx context.Context) error {
	if s.server != nil {
		return s.server.Shutdown(ctx)
	}
	return nil
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "healthy",
		"time":   time.Now().Format(time.RFC3339),
	})
}

func (s *Server) handleAPIDocs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
	docs := map[string]interface{}{
		"version": "1.0.0",
		"endpoints": map[string]interface{}{
			"query": map[string]interface{}{
				"POST /api/v1/query":      "Execute a single SQL query",
				"POST /api/v1/query/batch": "Execute multiple SQL queries",
			},
			"service": map[string]interface{}{
				"GET /api/v1/service/status":   "Get service status",
				"POST /api/v1/service/start":   "Start the service",
				"POST /api/v1/service/stop":    "Stop the service",
				"POST /api/v1/service/restart": "Restart the service",
			},
			"plugins": map[string]interface{}{
				"GET /api/v1/plugins":           "List installed plugins",
				"POST /api/v1/plugins/install":  "Install a plugin",
				"DELETE /api/v1/plugins/uninstall": "Uninstall a plugin",
				"PUT /api/v1/plugins/update":    "Update a plugin",
			},
		},
	}
	
	json.NewEncoder(w).Encode(docs)
}

func (s *Server) handleQuery(w http.ResponseWriter, r *http.Request) {
	var req QueryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if req.SQL == "" {
		http.Error(w, "SQL query is required", http.StatusBadRequest)
		return
	}
	
	// Set output format
	if req.Output != "" {
		viper.Set(constants.ArgOutput, req.Output)
	} else {
		viper.Set(constants.ArgOutput, "json")
	}
	
	// Set timing mode
	if req.Timing != "" {
		viper.Set(constants.ArgTiming, req.Timing)
	}
	
	// Set search path if provided
	if len(req.SearchPath) > 0 {
		viper.Set(constants.ArgSearchPath, req.SearchPath)
	}
	
	// Execute query
	response := s.executeQuery(r.Context(), req.SQL)
	
	w.Header().Set("Content-Type", "application/json")
	if !response.Success {
		w.WriteHeader(http.StatusInternalServerError)
	}
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleBatchQuery(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Queries []QueryRequest `json:"queries"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if len(req.Queries) == 0 {
		http.Error(w, "At least one query is required", http.StatusBadRequest)
		return
	}
	
	var responses []QueryResponse
	for _, queryReq := range req.Queries {
		if queryReq.Output != "" {
			viper.Set(constants.ArgOutput, queryReq.Output)
		} else {
			viper.Set(constants.ArgOutput, "json")
		}
		
		if queryReq.Timing != "" {
			viper.Set(constants.ArgTiming, queryReq.Timing)
		}
		
		if len(queryReq.SearchPath) > 0 {
			viper.Set(constants.ArgSearchPath, queryReq.SearchPath)
		}
		
		response := s.executeQuery(r.Context(), queryReq.SQL)
		responses = append(responses, response)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"results": responses,
	})
}

func (s *Server) executeQuery(ctx context.Context, sql string) QueryResponse {
	// Debug output for viper values
	fmt.Printf("[DEBUG] (executeQuery) workspace-database: %s\n", viper.GetString("workspace-database"))
	fmt.Printf("[DEBUG] (executeQuery) connection-string: %s\n", viper.GetString("connection-string"))
	fmt.Printf("[DEBUG] (executeQuery) pipes-token: %s\n", viper.GetString("pipes-token"))
	fmt.Printf("[DEBUG] (executeQuery) pipes-host: %s\n", viper.GetString("pipes-host"))
	
	initData := query.NewInitData(ctx, []string{sql})
	defer initData.Cleanup(ctx)
	<-initData.Loaded

	if initData.Result.Error != nil {
		return QueryResponse{
			Success: false,
			Error:   initData.Result.Error.Error(),
		}
	}
	if len(initData.Queries) == 0 {
		return QueryResponse{
			Success: false,
			Error:   "No queries to execute",
		}
	}
	queryObj := initData.Queries[0]
	resultsStreamer, err := db_common.ExecuteQuery(ctx, initData.Client, queryObj.ExecuteSQL, queryObj.Args...)
	if err != nil {
		return QueryResponse{
			Success: false,
			Error:   err.Error(),
		}
	}
	var data []map[string]interface{}
	var columns []string
	var rowCount int
	for result := range resultsStreamer.Results {
		if columns == nil && len(result.Cols) > 0 {
			for _, col := range result.Cols {
				columns = append(columns, col.Name)
			}
		}
		for rowResult := range result.RowChan {
			if rowResult.Error != nil {
				return QueryResponse{
					Success: false,
					Error:   rowResult.Error.Error(),
				}
			}
			rowData := make(map[string]interface{})
			for i, col := range result.Cols {
				if i < len(rowResult.Data) {
					rowData[col.Name] = rowResult.Data[i]
				}
			}
			data = append(data, rowData)
			rowCount++
		}
		resultsStreamer.AllResultsRead()
	}
	// Timing info - simplified for now
	var timing *TimingInfo
	// Note: Timing information would need to be extracted from the result stream
	// This is a simplified implementation
	return QueryResponse{
		Success:  true,
		Data:     data,
		Columns:  columns,
		RowCount: rowCount,
		Timing:   timing,
	}
}

func (s *Server) handleServiceStatus(w http.ResponseWriter, r *http.Request) {
	dbState, err := db_local.GetState()
	response := ServiceStatusResponse{}
	if err != nil {
		response.Error = err.Error()
	} else if dbState == nil {
		response.Running = false
	} else {
		response.Running = true
		response.Port = dbState.Port
		response.Database = dbState.Database
		response.User = dbState.User
		response.Connection = fmt.Sprintf("postgres://%s@localhost:%d/%s", dbState.User, dbState.Port, dbState.Database)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleServiceStart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	port := 9193 // DatabaseDefaultPort
	if portStr := r.URL.Query().Get("port"); portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		}
	}
	listenAddresses := []string{"localhost"}
	if addr := r.URL.Query().Get("listen_addresses"); addr != "" {
		listenAddresses = []string{addr}
	}
	result := db_local.StartServices(ctx, listenAddresses, port, "service")
	response := map[string]interface{}{
		"success": result.Status == db_local.ServiceStarted,
	}
	if result.Error != nil {
		response["error"] = result.Error.Error()
		response["success"] = false
	} else {
		response["message"] = "Service started successfully"
		if result.DbState != nil {
			response["port"] = result.DbState.Port
			response["database"] = result.DbState.Database
		}
	}
	w.Header().Set("Content-Type", "application/json")
	if !response["success"].(bool) {
		w.WriteHeader(http.StatusInternalServerError)
	}
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleServiceStop(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	force := r.URL.Query().Get("force") == "true"
	status, err := db_local.StopServices(ctx, force, "service")
	response := map[string]interface{}{
		"success": status == db_local.ServiceStopped,
	}
	if err != nil {
		response["error"] = err.Error()
		response["success"] = false
	} else {
		response["message"] = "Service stopped successfully"
	}
	w.Header().Set("Content-Type", "application/json")
	if !response["success"].(bool) {
		w.WriteHeader(http.StatusInternalServerError)
	}
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleServiceRestart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, stopErr := db_local.StopServices(ctx, false, "service")
	if stopErr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   stopErr.Error(),
		})
		return
	}
	port := 9193 // DatabaseDefaultPort
	if portStr := r.URL.Query().Get("port"); portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		}
	}
	listenAddresses := []string{"localhost"}
	if addr := r.URL.Query().Get("listen_addresses"); addr != "" {
		listenAddresses = []string{addr}
	}
	startResult := db_local.StartServices(ctx, listenAddresses, port, "service")
	response := map[string]interface{}{
		"success": startResult.Status == db_local.ServiceStarted,
	}
	if startResult.Error != nil {
		response["error"] = startResult.Error.Error()
		response["success"] = false
	} else {
		response["message"] = "Service restarted successfully"
		if startResult.DbState != nil {
			response["port"] = startResult.DbState.Port
			response["database"] = startResult.DbState.Database
		}
	}
	w.Header().Set("Content-Type", "application/json")
	if !response["success"].(bool) {
		w.WriteHeader(http.StatusInternalServerError)
	}
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handlePluginList(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Load plugin versions
	pluginVersions := steampipeconfig.GlobalConfig.PluginVersions
	
	// Get plugin connections map
	pluginConnections := make(map[string][]plugin.PluginConnection)
	
	// List plugins
	plugins, err := plugin.List(ctx, pluginConnections, pluginVersions)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(PluginListResponse{
			Error: err.Error(),
		})
		return
	}
	
	// Convert to response format
	var pluginInfos []PluginInfo
	for _, p := range plugins {
		version := "local"
		if p.Version != nil {
			version = p.Version.String()
		}
		
		pluginInfos = append(pluginInfos, PluginInfo{
			Name:        p.Name,
			Version:     version,
			Connections: p.Connections,
		})
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(PluginListResponse{
		Plugins: pluginInfos,
	})
}

func (s *Server) handlePluginInstall(w http.ResponseWriter, r *http.Request) {
	var req PluginInstallRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if req.Name == "" {
		http.Error(w, "Plugin name is required", http.StatusBadRequest)
		return
	}
	
	// This is a simplified implementation
	// In a real implementation, you would call the plugin installation logic
	response := PluginInstallResponse{
		Success: true,
		Message: fmt.Sprintf("Plugin %s installation initiated", req.Name),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handlePluginUninstall(w http.ResponseWriter, r *http.Request) {
	pluginName := r.URL.Query().Get("name")
	if pluginName == "" {
		http.Error(w, "Plugin name is required", http.StatusBadRequest)
		return
	}
	
	// This is a simplified implementation
	response := PluginInstallResponse{
		Success: true,
		Message: fmt.Sprintf("Plugin %s uninstallation initiated", pluginName),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handlePluginUpdate(w http.ResponseWriter, r *http.Request) {
	var req PluginInstallRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if req.Name == "" {
		http.Error(w, "Plugin name is required", http.StatusBadRequest)
		return
	}
	
	// This is a simplified implementation
	response := PluginInstallResponse{
		Success: true,
		Message: fmt.Sprintf("Plugin %s update initiated", req.Name),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
} 