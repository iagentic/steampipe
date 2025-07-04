#!/usr/bin/env python3
"""
Steampipe REST API Client Example

This example demonstrates how to use the Steampipe REST API
to execute queries and manage the service programmatically.
"""

import requests
import json
import time
from typing import Dict, List, Optional

class SteampipeAPIClient:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
    
    def health_check(self) -> Dict:
        """Check if the API server is healthy."""
        response = self.session.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()
    
    def execute_query(self, sql: str, output: str = "json", timing: str = "off") -> Dict:
        """Execute a single SQL query."""
        payload = {
            "sql": sql,
            "output": output,
            "timing": timing
        }
        
        response = self.session.post(f"{self.base_url}/api/v1/query", json=payload)
        response.raise_for_status()
        return response.json()
    
    def execute_batch_queries(self, queries: List[Dict]) -> Dict:
        """Execute multiple SQL queries in a single request."""
        payload = {"queries": queries}
        
        response = self.session.post(f"{self.base_url}/api/v1/query/batch", json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_service_status(self) -> Dict:
        """Get the current status of the Steampipe service."""
        response = self.session.get(f"{self.base_url}/api/v1/service/status")
        response.raise_for_status()
        return response.json()
    
    def start_service(self, port: Optional[int] = None, listen_addresses: Optional[str] = None) -> Dict:
        """Start the Steampipe service."""
        params = {}
        if port:
            params['port'] = port
        if listen_addresses:
            params['listen_addresses'] = listen_addresses
        
        response = self.session.post(f"{self.base_url}/api/v1/service/start", params=params)
        response.raise_for_status()
        return response.json()
    
    def stop_service(self, force: bool = False) -> Dict:
        """Stop the Steampipe service."""
        params = {"force": force}
        response = self.session.post(f"{self.base_url}/api/v1/service/stop", params=params)
        response.raise_for_status()
        return response.json()
    
    def restart_service(self, port: Optional[int] = None, listen_addresses: Optional[str] = None) -> Dict:
        """Restart the Steampipe service."""
        params = {}
        if port:
            params['port'] = port
        if listen_addresses:
            params['listen_addresses'] = listen_addresses
        
        response = self.session.post(f"{self.base_url}/api/v1/service/restart", params=params)
        response.raise_for_status()
        return response.json()
    
    def list_plugins(self) -> Dict:
        """List all installed plugins."""
        response = self.session.get(f"{self.base_url}/api/v1/plugins")
        response.raise_for_status()
        return response.json()
    
    def install_plugin(self, name: str, version: Optional[str] = None) -> Dict:
        """Install a plugin."""
        payload = {"name": name}
        if version:
            payload["version"] = version
        
        response = self.session.post(f"{self.base_url}/api/v1/plugins/install", json=payload)
        response.raise_for_status()
        return response.json()
    
    def uninstall_plugin(self, name: str) -> Dict:
        """Uninstall a plugin."""
        params = {"name": name}
        response = self.session.delete(f"{self.base_url}/api/v1/plugins/uninstall", params=params)
        response.raise_for_status()
        return response.json()
    
    def update_plugin(self, name: str, version: Optional[str] = None) -> Dict:
        """Update a plugin."""
        payload = {"name": name}
        if version:
            payload["version"] = version
        
        response = self.session.put(f"{self.base_url}/api/v1/plugins/update", json=payload)
        response.raise_for_status()
        return response.json()

def main():
    """Example usage of the Steampipe API client."""
    
    # Initialize the client
    client = SteampipeAPIClient()
    
    try:
        # Check if the API server is running
        print("Checking API server health...")
        health = client.health_check()
        print(f"API Server Status: {health['status']}")
        print()
        
        # Check service status
        print("Checking Steampipe service status...")
        status = client.get_service_status()
        if status['running']:
            print(f"Service is running on port {status['port']}")
            print(f"Database: {status['database']}")
        else:
            print("Service is not running")
            print("Starting service...")
            start_result = client.start_service()
            if start_result['success']:
                print("Service started successfully")
                time.sleep(2)  # Wait for service to fully start
            else:
                print(f"Failed to start service: {start_result.get('error', 'Unknown error')}")
                return
        print()
        
        # List installed plugins
        print("Listing installed plugins...")
        plugins = client.list_plugins()
        if 'plugins' in plugins:
            print(f"Found {len(plugins['plugins'])} plugins:")
            for plugin in plugins['plugins']:
                print(f"  - {plugin['name']} (v{plugin['version']})")
                if plugin['connections']:
                    print(f"    Connections: {', '.join(plugin['connections'])}")
        print()
        
        # Execute a simple query (if AWS plugin is available)
        print("Executing sample queries...")
        
        # Check if we have any cloud plugins
        has_aws = any('aws' in plugin['name'].lower() for plugin in plugins.get('plugins', []))
        
        if has_aws:
            # AWS-specific queries
            queries = [
                {
                    "sql": "SELECT COUNT(*) as bucket_count FROM aws_s3_bucket",
                    "output": "json"
                },
                {
                    "sql": "SELECT COUNT(*) as user_count FROM aws_iam_user",
                    "output": "json"
                }
            ]
            
            print("Executing AWS queries...")
            batch_result = client.execute_batch_queries(queries)
            
            if 'results' in batch_result:
                for i, result in enumerate(batch_result['results']):
                    if result['success']:
                        print(f"Query {i+1}: {result['row_count']} rows returned")
                        if result['data']:
                            for key, value in result['data'][0].items():
                                print(f"  {key}: {value}")
                    else:
                        print(f"Query {i+1} failed: {result.get('error', 'Unknown error')}")
        else:
            # Generic system query
            print("Executing system query...")
            result = client.execute_query("SELECT version() as postgres_version")
            if result['success']:
                print(f"PostgreSQL Version: {result['data'][0]['postgres_version']}")
            else:
                print(f"Query failed: {result.get('error', 'Unknown error')}")
        
        print()
        
        # Example of installing a plugin (commented out to avoid accidental installation)
        # print("Installing AWS plugin...")
        # install_result = client.install_plugin("aws")
        # print(f"Install result: {install_result['message']}")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the Steampipe API server.")
        print("Make sure the server is running with: steampipe api")
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_data = e.response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Response text: {e.response.text}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main() 