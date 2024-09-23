#!/bin/bash

# Function to check if a package is installed globally
is_package_installed() {
    bun pm list -g | grep -q "^$1@"
}

# Check if pm2 is already installed
if is_package_installed "pm2"; then
    echo "pm2 is already installed globally."
else
    echo "pm2 is not installed. Installing now..."
    bun add -g pm2

    # Verify installation
    if is_package_installed "pm2"; then
        echo "pm2 has been successfully installed."
    else
        echo "Failed to install pm2. Please check your internet connection and try again."
        exit 1
    fi
fi

# Run pm2
echo "Starting pm2..."
pm2 start pm2.config.js