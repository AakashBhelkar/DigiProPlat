# PowerShell script to remove unused template directories
# Run this from the project root directory

Write-Host "Cleaning up unused template directories..." -ForegroundColor Yellow

$directoriesToRemove = @(
    "starter-vite-js",
    "vite-js",
    "jules-scratch"
)

foreach ($dir in $directoriesToRemove) {
    if (Test-Path $dir) {
        Write-Host "Removing $dir..." -ForegroundColor Cyan
        try {
            Remove-Item -Recurse -Force $dir
            Write-Host "✓ Removed $dir" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to remove $dir : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠ $dir not found, skipping..." -ForegroundColor Yellow
    }
}

Write-Host "`nCleanup complete!" -ForegroundColor Green
Write-Host "Approximate space saved: ~155MB" -ForegroundColor Cyan

