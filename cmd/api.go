package cmd

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	pconstants "github.com/turbot/pipe-fittings/v2/constants"
	"github.com/turbot/steampipe/pkg/api"
	"github.com/turbot/steampipe/pkg/cmdconfig"
	"github.com/turbot/steampipe/pkg/constants"
	"github.com/turbot/steampipe/pkg/error_helpers"
)

func apiCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "api",
		Args:  cobra.NoArgs,
		Run:   runAPICmd,
		Short: "Start Steampipe REST API server",
		Long: `Start Steampipe REST API server.

Run Steampipe as a REST API server, exposing all command-line functionality
through HTTP endpoints for programmatic access.

Examples:

  # Start API server on default port 8080
  steampipe api

  # Start API server on custom port
  steampipe api --port 9000

  # Start API server with specific host
  steampipe api --host 0.0.0.0 --port 8080`,
	}

	cmdconfig.
		OnCmd(cmd).
		AddIntFlag("port", 8080, "API server port").
		AddStringFlag("host", "localhost", "API server host").
		AddBoolFlag(pconstants.ArgHelp, false, "Help for api", cmdconfig.FlagOptions.WithShortHand("h"))

	return cmd
}

func runAPICmd(cmd *cobra.Command, _ []string) {
	ctx := cmd.Context()
	
	port := viper.GetInt("port")
	host := viper.GetString("host")
	
	// Create API server
	server := api.NewServer(port)
	
	// Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	
	// Start server in goroutine
	go func() {
		fmt.Printf("Starting Steampipe REST API server on %s:%d\n", host, port)
		fmt.Printf("API documentation available at: http://%s:%d/api/v1/docs\n", host, port)
		fmt.Printf("Health check available at: http://%s:%d/health\n", host, port)
		fmt.Println("Press Ctrl+C to stop the server")
		
		if err := server.Start(); err != nil {
			log.Printf("Server error: %v", err)
			os.Exit(1)
		}
	}()
	
	// Wait for shutdown signal
	<-sigChan
	fmt.Println("\nShutting down server...")
	
	// Graceful shutdown
	shutdownCtx, cancel := context.WithTimeout(context.Background(), constants.DBStartTimeout)
	defer cancel()
	
	if err := server.Stop(shutdownCtx); err != nil {
		error_helpers.ShowError(ctx, err)
		exitCode = constants.ExitCodeServiceStartupFailure
		return
	}
	
	fmt.Println("Server stopped gracefully")
} 