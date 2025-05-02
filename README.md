# Network Traffic Analyzer

A web-based tool that captures and displays IP packets from a network interface in real-time. It allows users to start and stop packet capturing, view captured data, and download logs for further analysis.

## Built With

* **Backend**: Python, Flask, Flask-SocketIO, Scapy
* **Frontend**: React, Vite, Tailwind CSS

## Features

* Start/Stop packet capture with user-defined packet count
* Real-time packet count and live updates via WebSocket
* Fetch and display captured packet details
* Download captured packets as a log file
* CORS support for frontend-backend communication

## Project Structure

```bash
network-traffic-analyzer
├── backend
│   ├── app.py           # Flask & SocketIO server
│   ├── sniffer.py       # Scapy packet-sniffing logic
│   ├── requirements.txt # Python dependencies
│   └── venv             # Python virtual environment
└── frontend
    ├── src
    │   └── App.jsx      # React frontend UI
    ├── vite.config.js   # Vite configuration
    ├── package.json     # Node dependencies & scripts
    └── tailwind.config.js # Tailwind CSS config
```

## Prerequisites

* Python 3.9+
* Node.js 16+
* npm or yarn
* (macOS) Permissions to access BPF devices: `sudo chmod 666 /dev/bpf*`

## Setup & Run

Make the start script executable and run it:

```bash
chmod +x start.sh
./start.sh
```

This will automatically set up the backend virtual environment, install dependencies, and start both the backend and frontend servers.

## Stopping the Servers

To stop both the frontend and backend servers, you can use the `stop.sh` script.

Run the following command:

```bash
./stop.sh
```

## Usage

1. Open the frontend in your browser (default: `http://localhost:5173`).
2. Enter the number of packets to capture and click **Start Capture**.
3. View real-time updates on packet count and details.
4. Click **Stop Capture** to end sniffing early.
5. Click **Fetch Packets** to display the list of captured packets.
6. Click **Download Captured Packets Log** to download a `.log` file.
