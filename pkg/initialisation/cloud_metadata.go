package initialisation

import (
	"context"

	"github.com/spf13/viper"
	"github.com/turbot/pipe-fittings/v2/constants"
	"github.com/turbot/pipe-fittings/v2/steampipeconfig"
	"fmt"
)

func getPipesMetadata(ctx context.Context) (*steampipeconfig.PipesMetadata, error) {
	// Debug output for viper values
	fmt.Printf("[DEBUG] workspace-database: %s\n", viper.GetString(constants.ArgWorkspaceDatabase))
	fmt.Printf("[DEBUG] connection-string: %s\n", viper.GetString(constants.ArgConnectionString))
	fmt.Printf("[DEBUG] pipes-token: %s\n", viper.GetString(constants.ArgPipesToken))
	fmt.Printf("[DEBUG] pipes-host: %s\n", viper.GetString(constants.ArgPipesHost))
	
	// Force local mode - always use local database
	// This removes the need for Turbot Pipes cloud authentication
	viper.Set(constants.ArgWorkspaceDatabase, "local")
	
	// Also ensure connection string is not set to force local mode
	viper.Set(constants.ArgConnectionString, "")
	
	// Ensure pipes token is not set to avoid cloud authentication
	viper.Set(constants.ArgPipesToken, "")
	
	// Also ensure pipes host is not set to avoid cloud authentication
	viper.Set(constants.ArgPipesHost, "")
	
	// local database - nothing to do here
	return nil, nil
}
