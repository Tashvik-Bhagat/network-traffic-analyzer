from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO
import os
from flask_cors import CORS
from sniffer import start_sniffing, stop_sniffing, get_latest_log, get_captured_packets, init_socketio

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
LOG_DIR = os.getcwd()

# Initialize sniffer with socketio instance
init_socketio(socketio)

@app.route('/')
def home():
    return "Welcome to the Network Traffic Analyzer!"

@app.route('/capture', methods=['POST'])
def capture():
    data = request.get_json() or {}
    count = int(data.get("packet_count", 100))
    save_log = data.get("save_log", False)
    start_sniffing(count, save_log)
    return jsonify({"status": "started", "packet_count": count}), 200

@app.route('/stop', methods=['POST'])
def stop():
    stop_sniffing()
    return jsonify({"status": "stopped", "captured": get_captured_packets()}), 200

@app.route('/download', methods=['GET'])
def download():
    log = get_latest_log()
    if not log or not os.path.isfile(os.path.join(LOG_DIR, log)):
        return jsonify({"error": "no log available"}), 404
    return send_from_directory(LOG_DIR, log, as_attachment=True)

@app.route('/packets', methods=['GET'])
def packets():
    packets = get_captured_packets()
    return jsonify({"captured_packets": packets}), 200

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)
