#!/bin/bash
# Shell Script: Stop Development Servers (Port 3000 and 5000)
# Compatible with Git Bash / WSL / Linux
# Usage: ./kill-dev-ports.sh

echo "Stopping development servers (Port 3000 and 5000)..."
echo ""

# Function: Kill processes on specified port
kill_port() {
    local port=$1
    echo "Checking Port $port..."
    
    if command -v netstat &> /dev/null; then
        # Use netstat to find processes
        local pids=$(netstat -ano 2>/dev/null | grep ":$port " | awk '{print $5}' | sort -u)
        if [ ! -z "$pids" ]; then
            echo "Found processes on Port $port"
            for pid in $pids; do
                if [ "$pid" != "0" ] && [ ! -z "$pid" ]; then
                    echo "Stopping process PID: $pid"
                    taskkill //F //PID $pid 2>/dev/null || kill -9 $pid 2>/dev/null || echo "Unable to stop PID: $pid"
                fi
            done
            echo "✅ Processed Port $port programs"
        else
            echo "ℹ️  No processes running on Port $port"
        fi
    else
        echo "❌ Unable to use netstat command"
    fi
    echo ""
}

# Stop Port 3000 (frontend)
kill_port 3000

# Stop Port 5000 (backend)
kill_port 5000

# Additional cleanup: Stop all Node.js processes
echo "Cleaning up remaining Node.js processes..."
if command -v taskkill &> /dev/null; then
    # Windows environment
    taskkill //F //IM node.exe 2>/dev/null && echo "✅ Cleaned up Node.js processes" || echo "ℹ️  No additional Node.js processes found"
elif command -v pkill &> /dev/null; then
    # Linux/macOS environment
    pkill -f node 2>/dev/null && echo "✅ Cleaned up Node.js processes" || echo "ℹ️  No additional Node.js processes found"
else
    echo "ℹ️  Unable to use pkill or taskkill command"
fi

echo ""
echo "🎉 Development server cleanup completed!"
echo ""
read -p "Press Enter to continue..." 