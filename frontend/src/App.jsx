import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";

export default function App() {
  const [count, setCount] = useState("");
  const [packets, setPackets] = useState([]);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [saveLog, setSaveLog] = useState(false);

  const API_BASE = "http://127.0.0.1:5001";

  const handleProgress = useCallback(async (data) => {
    setProgress(data.count);
    if (data.count >= data.total) {
      setIsCapturing(false);
      setStatus("Capture complete");
      const response = await axios.get(`${API_BASE}/packets`);
      setPackets(response.data.captured_packets || []);
    }
  }, []);

  useEffect(() => {
    const socket = io(API_BASE, {
      transports: ['websocket'],
      reconnectionAttempts: 5
    });
    
    socket.on('capture_progress', handleProgress);
    return () => socket.disconnect();
  }, [handleProgress]);

  const startCapture = async () => {
    if (!count || isNaN(count) || count <= 0) {
      setStatus("Please enter a valid number of packets to capture");
      return;
    }

    setPackets([]); // Clear existing packets
    setIsCapturing(true);
    setProgress(0);
    setStatus("Starting capture…");
    
    try {
      await axios.post(`${API_BASE}/capture`, { 
        packet_count: Number(count),
        save_log: saveLog 
      });
      setStatus("Capturing packets...");
    } catch (e) {
      console.error(e);
      setStatus("Error starting capture");
      setIsCapturing(false);
    }
  };

  const stopCapture = async () => {
    try {
      const response = await axios.post(`${API_BASE}/stop`);
      setPackets(response.data.captured || []);
      setStatus("Capture stopped");
      setIsCapturing(false);
    } catch (e) {
      console.error(e);
      setStatus("Error stopping capture");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-800 via-neutral-600 to-zinc-800 text-gray-100 flex items-center justify-center p-6">
      <div className="bg-zinc-900/90 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-3xl border border-zinc-800">
        <h1 className="text-4xl font-extrabold mb-8 text-zinc-200 text-center tracking-wide">
          Network Traffic Analyzer
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-zinc-400">
            Number of Packets to Capture:
          </label>
          <input
            type="number"
            placeholder="Enter number of packets"
            className="w-full p-3 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            disabled={isCapturing}
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={saveLog}
              onChange={(e) => setSaveLog(e.target.checked)}
              className="form-checkbox rounded bg-zinc-800 border-zinc-700"
            />
            <span className="text-sm text-zinc-400">Save capture log file</span>
          </label>
        </div>

        {isCapturing && (
          <div className="mb-4">
            <div className="w-full bg-zinc-800 rounded-full h-2.5">
              <div 
                className="bg-zinc-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress / count) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-sm mt-2 text-zinc-400">
              Packets Captured: {progress} / {count}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <button
            onClick={startCapture}
            disabled={isCapturing || !count || isNaN(count) || count <= 0}
            className="px-6 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold shadow-md transition duration-300 disabled:opacity-50"
          >
            Start Capture
          </button>
          <button
            onClick={stopCapture}
            disabled={!isCapturing}
            className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold shadow-md transition duration-300 disabled:opacity-50"
          >
            Stop Capture
          </button>
        </div>

        {saveLog && (
          <div className="mb-6 text-center">
            <a
              href={`${API_BASE}/download`}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-200 underline transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Captured Packets Log
            </a>
          </div>
        )}

        {status && (
          <p className="mb-6 text-sm text-center bg-zinc-800 text-zinc-300 py-3 px-5 rounded-lg shadow-md">
            {status}
          </p>
        )}

        {packets.length > 0 && (
          <div className="max-h-72 overflow-y-auto border border-zinc-700 rounded-lg bg-zinc-800 shadow-inner">
            <ul className="list-decimal list-inside space-y-2 p-5 text-sm text-zinc-300">
              {packets.map((p, i) => (
                <li
                  key={i}
                  className="hover:text-zinc-100 transition duration-150"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
