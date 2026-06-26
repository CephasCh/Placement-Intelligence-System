@echo off
setlocal

echo Placement Intelligence System
echo ----------------------------------------

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js and try again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install npm and try again.
  pause
  exit /b 1
)

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:11434/api/tags -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo Ollama is not reachable at http://localhost:11434.
  echo Start Ollama manually before using the AI chatbot.
) else (
  echo Ollama is reachable.
)

if not exist node_modules (
  echo Installing dependencies...
  npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

start "" http://localhost:3000
npm run dev

endlocal
