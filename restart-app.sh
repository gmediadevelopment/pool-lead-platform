# Passenger restart script

echo "=== Restarting Passenger App ==="

# Create tmp directory if it doesn't exist
mkdir -p tmp

# Remove old restart file
rm -f tmp/restart.txt

# Create new restart file
touch tmp/restart.txt

# Also try to restart via Passenger
if [ -f "passenger" ]; then
    passenger stop
    sleep 2
    passenger start
fi

# Check if process is running
echo ""
echo "Checking for Node.js processes:"
ps aux | grep node | grep -v grep

echo ""
echo "=== Restart triggered ==="
echo "Wait 30 seconds, then test: https://marktplatz.poolbau-vergleich.de"
