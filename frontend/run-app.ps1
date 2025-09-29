# PowerShell script to run the React application
$ErrorActionPreference = "Stop"

Write-Host "Starting E-Library application..."
Write-Host "Checking for react-scripts..."

# Define the path to react-scripts
$reactScriptsPath = "./node_modules/react-scripts/bin/react-scripts.js"

# Verify the path exists
if (Test-Path $reactScriptsPath) {
    Write-Host "Found react-scripts at: $reactScriptsPath"
    
    # Run the application using node
    Write-Host "Starting the application..."
    node $reactScriptsPath start
} else {
    Write-Host "Error: Could not find react-scripts at: $reactScriptsPath"
    Write-Host "Trying to run with npx..."
    
    # Try using npx as fallback
    npx react-scripts start
} 