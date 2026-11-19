$proc = Start-Process node -ArgumentList "$PSScriptRoot\src\server\index.js" -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3
Write-Host "Server launched PID: $($proc.Id)"
