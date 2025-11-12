#!/bin/bash
# Bash script to remove unused template directories
# Run this from the project root directory

echo "Cleaning up unused template directories..."

directories=("starter-vite-js" "vite-js" "jules-scratch")

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "Removing $dir..."
        rm -rf "$dir"
        echo "✓ Removed $dir"
    else
        echo "⚠ $dir not found, skipping..."
    fi
done

echo ""
echo "Cleanup complete!"
echo "Approximate space saved: ~155MB"

