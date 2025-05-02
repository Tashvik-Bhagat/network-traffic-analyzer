from scapy.all import sniff, IP, TCP, UDP, ICMP
from datetime import datetime
import threading
from flask_socketio import SocketIO

# Globals
sniff_thread = None
stop_sniff = threading.Event()
captured_packets = []  # in-memory list for frontend display
packet_count = 0
target_count = 0
socketio = None
save_to_file = False
latest_log = None

def init_socketio(socket_instance):
    global socketio
    socketio = socket_instance

def packet_callback(packet):
    global packet_count, captured_packets
    if IP not in packet or packet_count >= target_count:
        return True if packet_count >= target_count else False
        
    packet_count += 1
    
    ip_layer = packet[IP]
    info = f"{ip_layer.src} -> {ip_layer.dst} | Protocol: {ip_layer.proto}"
    
    if TCP in packet:
        info += f" | TCP {packet[TCP].sport}->{packet[TCP].dport}"
    elif UDP in packet:
        info += f" | UDP {packet[UDP].sport}->{packet[UDP].dport}"
    elif ICMP in packet:
        info += f" | ICMP {packet[ICMP].type}/{packet[ICMP].code}"

    captured_packets.append(info)

    if save_to_file and latest_log:
        with open(latest_log, "a") as f:
            f.write(info + "\n")

    if socketio and packet_count % 5 == 0 or packet_count >= target_count:
        socketio.emit('capture_progress', {'count': packet_count, 'total': target_count})

    return packet_count >= target_count

def _sniff():
    stop_sniff.clear()
    try:
        sniff(
            filter="ip",
            prn=packet_callback,
            iface="en0",
            stop_filter=lambda x: stop_sniff.is_set(),
            count=target_count,  # Add explicit count
            store=0  # Don't store packets in memory
        )
    except Exception as e:
        print(f"Sniffing error: {e}")

def start_sniffing(count, should_save=False):
    global sniff_thread, latest_log, captured_packets, packet_count, target_count, save_to_file
    
    # Reset state
    packet_count = 0
    target_count = count
    save_to_file = should_save
    captured_packets.clear()
    
    if save_to_file:
        latest_log = f"captured_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    else:
        latest_log = None

    sniff_thread = threading.Thread(target=_sniff, daemon=True)
    sniff_thread.start()

def stop_sniffing():
    stop_sniff.set()
    if sniff_thread and sniff_thread.is_alive():
        sniff_thread.join(timeout=1.0)  # Wait max 1 second

def get_latest_log():
    return latest_log

def get_captured_packets():
    return captured_packets
