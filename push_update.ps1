$ErrorActionPreference = "Continue"

Write-Host "Staging files..."
git add .

Write-Host "Committing changes..."
git commit -m "Fix member ID generation logic and syntax errors"

Write-Host "Pushing to GitHub..."
git push origin main

Write-Host "Done!"
