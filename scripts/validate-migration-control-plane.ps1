$ErrorActionPreference = "Stop"

$validator = Join-Path $PSScriptRoot "validate-migration-control-plane.mjs"
& node $validator @args
exit $LASTEXITCODE
