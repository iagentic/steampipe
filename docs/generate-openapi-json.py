#!/usr/bin/env python3
"""
Script to convert OpenAPI YAML specification to JSON format.
"""

import yaml
import json
import sys
import os

def yaml_to_json(yaml_file, json_file):
    """Convert YAML file to JSON file."""
    try:
        with open(yaml_file, 'r', encoding='utf-8') as f:
            yaml_content = yaml.safe_load(f)
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(yaml_content, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully converted {yaml_file} to {json_file}")
        return True
    except Exception as e:
        print(f"❌ Error converting {yaml_file} to {json_file}: {e}")
        return False

def main():
    yaml_file = "openapi.yaml"
    json_file = "openapi.json"
    
    if not os.path.exists(yaml_file):
        print(f"❌ YAML file {yaml_file} not found")
        sys.exit(1)
    
    success = yaml_to_json(yaml_file, json_file)
    if success:
        print(f"📄 OpenAPI JSON specification saved to: {json_file}")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
