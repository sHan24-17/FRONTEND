$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Iniciando pruebas de API en http://localhost:5050..." -ForegroundColor Cyan

# Comprobar si el servidor ya está respondiendo
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5050/" -Method GET -TimeoutSec 2
    Write-Host "[OK] Servidor ya activo:" $health.nombre -ForegroundColor Green
} catch {
    Write-Host "[INFO] Servidor no detectado, iniciando proceso node..." -ForegroundColor Yellow
    $proc = Start-Process node -ArgumentList "src/server/index.js" -WorkingDirectory $scriptDir -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

try {
    Write-Host "`n1. Probar GET / (Health Check)" -ForegroundColor Cyan
    $resHealth = Invoke-RestMethod -Uri "http://localhost:5050/" -Method GET
    Write-Host "ÉXITO: Version =" $resHealth.version -ForegroundColor Green

    Write-Host "`n2. Probar GET /api/v1/usuarios?page=1&limit=3" -ForegroundColor Cyan
    $resUsers = Invoke-RestMethod -Uri "http://localhost:5050/api/v1/usuarios?page=1&limit=3" -Method GET
    Write-Host "ÉXITO: Total usuarios =" $resUsers.paginacion.totalRegistros ", Obtenidos =" $resUsers.datos.Length -ForegroundColor Green

    Write-Host "`n3. Probar GET /api/v1/productos?page=1&limit=3" -ForegroundColor Cyan
    $resProds = Invoke-RestMethod -Uri "http://localhost:5050/api/v1/productos?page=1&limit=3" -Method GET
    Write-Host "ÉXITO: Total productos =" $resProds.paginacion.totalRegistros ", Obtenidos =" $resProds.datos.Length -ForegroundColor Green

    Write-Host "`n4. Probar POST /api/v1/usuarios (Crear Usuario de Prueba)" -ForegroundColor Cyan
    $tempEmail = "test_smoke_$([guid]::NewGuid().ToString().Substring(0,8))@example.com"
    $body = @{
        nombre = "Usuario Smoke Test"
        email = $tempEmail
        rol = "auditor"
        activo = $true
    } | ConvertTo-Json

    $resCreate = Invoke-RestMethod -Uri "http://localhost:5050/api/v1/usuarios" -Method POST -Body $body -ContentType "application/json"
    $createdId = $resCreate.datos.id
    Write-Host "ÉXITO: Usuario creado con ID =" $createdId -ForegroundColor Green

    Write-Host "`n5. Probar PATCH /api/v1/usuarios/$createdId (Actualizar Usuario)" -ForegroundColor Cyan
    $patchBody = @{
        nombre = "Usuario Smoke Modificado"
    } | ConvertTo-Json
    $resPatch = Invoke-RestMethod -Uri "http://localhost:5050/api/v1/usuarios/$createdId" -Method PATCH -Body $patchBody -ContentType "application/json"
    Write-Host "ÉXITO: Nombre actualizado =" $resPatch.datos.nombre -ForegroundColor Green

    Write-Host "`n6. Probar DELETE /api/v1/usuarios/$createdId (Eliminar Usuario)" -ForegroundColor Cyan
    $resDelete = Invoke-WebRequest -Uri "http://localhost:5050/api/v1/usuarios/$createdId" -Method DELETE -UseBasicParsing
    Write-Host "ÉXITO: Código HTTP DELETE =" $resDelete.StatusCode -ForegroundColor Green

    Write-Host "`n=== TODAS LAS PRUEBAS DEL BACKEND PASARON EXITOSAMENTE ===" -ForegroundColor Green

} catch {
    Write-Host "ERROR EN PRUEBAS:" $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Detalles:" $_.ErrorDetails.Message -ForegroundColor Red
    }
} finally {
    if ($proc) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}
