#!/bin/bash
# Start the MQTT Flight Tracker

cd "$(dirname "$0")"

# Check if paho-mqtt is installed
python3 -c "import paho.mqtt.client" 2>/dev/null || {
    echo "Installing required packages..."
    pip3 install -r requirements-flight.txt
}

# Run the tracker
echo "Starting MQTT Flight Tracker..."
echo "Press Ctrl+C to stop"
python3 flights_mqtt.py
