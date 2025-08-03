@echo off
echo Starting SAM2 Application...

echo.
echo Starting FastAPI Backend...
cd /d D:\sam2\backend
call D:\sam2\venv\Scripts\activate.bat
start "Backend" cmd /k "python main.py"

echo.
echo Starting React Frontend...
cd /d D:\sam2\frontend
start "Frontend" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
pause
