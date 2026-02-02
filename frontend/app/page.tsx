"use client";

import { useState, useEffect, useRef } from 'react';
import { Shield, Activity, AlertTriangle, Volume2, Brain, Zap } from 'lucide-react';

interface Message {
  role: 'scammer' | 'agent';
  text: string;
  timestamp: string;
}

interface Log {
  id: number;
  text: string;
  type: 'info' | 'warn' | 'crit';
}

interface ResponseTime {
  timestamp: number;
  latency: number;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<Log[]>([{ id: Date.now(), text: "System initialized", type: 'info' }]);
  const [extractedData, setExtractedData] = useState<Array<{ key: string; value: string }>>([]);

  const [threatLevel, setThreatLevel] = useState(94);
  const [fatigue, setFatigue] = useState(0);
  const [timeWasted, setTimeWasted] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [intelCount, setIntelCount] = useState(0);
  const [responseTimes, setResponseTimes] = useState<ResponseTime[]>([]);

  const [isTyping, setIsTyping] = useState(false);
  const [typingSource, setTypingSource] = useState<'scammer' | 'agent' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const isProcessing = useRef(false);

  // Simulate live threat level fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatLevel(prev => {
        const change = (Math.random() - 0.5) * 3;
        return Math.max(85, Math.min(99, prev + change));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate fatigue increase
  useEffect(() => {
    if (messages.length > 0) {
      const interval = setInterval(() => {
        setFatigue(prev => Math.min(100, prev + Math.random() * 2));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [messages]);

  // Time Wasted Counter
  useEffect(() => {
    const timer = setInterval(() => {
      if (messages.length > 0) {
        setTimeWasted(prev => prev + 1);
        setMoneySaved(prev => prev + Math.floor(Math.random() * 50));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [messages]);

  // Auto Scroll with smooth behavior
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    if (logRef.current) {
      logRef.current.scrollTo({
        top: logRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, logs]);

  const sendMessage = async (text: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    const startTime = Date.now();
    const msg: Message = { role: 'scammer', text: text, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, msg]);

    setIsTyping(true);
    setTypingSource('agent');

    try {
      const payload = {
        sessionId: "manual_test_session_001",
        message: {
          sender: "scammer",
          text: text,
          timestamp: new Date().toISOString()
        },
        conversationHistory: [],
        metadata: { channel: "MANUAL_TEST", language: "en", locale: "IN" }
      };

      const res = await fetch('http://127.0.0.1:8000/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '12345'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      // Track response time
      setResponseTimes(prev => [...prev.slice(-9), { timestamp: Date.now(), latency }]);

      const thoughts = data.debug_thought ? data.debug_thought.split('|') : ["Processing...", "Standard"];
      addLog({ text: `BRAIN: ${thoughts[0]}`, type: 'info' });
      addLog({ text: `Response latency: ${latency}ms`, type: 'info' });

      if (data.intelligence?.upiIds?.length > 0) {
        addLog({ text: `CAPTURED UPI: ${data.intelligence.upiIds[0]}`, type: 'crit' });
        setExtractedData(prev => {
          const items = data.intelligence.upiIds.map((u: string) => ({ key: 'UPI', value: u }));
          const newItems = items.filter((n: any) => !prev.find(p => p.value === n.value));
          setIntelCount(c => c + newItems.length);
          return [...prev, ...newItems];
        });
      }

      const replyText = data.reply || data.response || "Error in response format";
      addMessage('agent', replyText);

    } catch (err) {
      console.error(err);
      addLog({ text: "API CONNECTION FAILED", type: 'crit' });
      addMessage('agent', "SYSTEM ERROR: Backend Offline?");
    } finally {
      setIsTyping(false);
      setTypingSource(null);
      isProcessing.current = false;
    }
  };

  const handleManualSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      sendMessage(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  const simulateCall = () => {
    setMessages([]);
    setLogs([]);
    setExtractedData([]);
    setFatigue(0);
    setThreatLevel(94);
    setTimeWasted(0);
    setMoneySaved(0);
    setIntelCount(0);
    setResponseTimes([]);
    addLog({ text: "SESSION RESET", type: 'info' });
  };

  const addMessage = (role: 'scammer' | 'agent', text: string) => {
    setMessages(prev => [...prev, { role, text, timestamp: new Date().toLocaleTimeString() }]);
  };

  const addLog = (log: { text: string, type: 'info' | 'warn' | 'crit' }) => {
    setLogs(prev => [...prev.slice(-20), { id: Date.now(), ...log }]);
  };

  // Circular gauge component
  const CircularGauge = ({ value, max = 100, color, label }: { value: number, max?: number, color: string, label: string }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-800"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 drop-shadow-[0_0_8px_currentColor]"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-2xl font-bold`} style={{ color }}>{value.toFixed(0)}%</span>
          </div>
        </div>
        <span className="text-xs mt-2 text-gray-400">{label}</span>
      </div>
    );
  };

  // Response time chart
  const ResponseChart = () => {
    const maxLatency = Math.max(...responseTimes.map(r => r.latency), 2000);
    return (
      <div className="h-24 flex items-end gap-1 px-2">
        {responseTimes.map((rt, i) => {
          const height = (rt.latency / maxLatency) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all duration-300"
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="h-screen w-screen bg-black text-green-500 font-mono overflow-hidden flex flex-col p-2 relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10"
        style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}>
      </div>

      <header className="flex justify-between items-center border-b border-green-800 pb-2 mb-2 z-10 bg-black/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-green-400 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold tracking-widest text-green-400 drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">VIGILANTE AI</h1>
              <p className="text-xs text-green-600">SCAM BAITER PROTOCOL v2.1</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-xs items-center">
          {isTyping && (
            <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
              <Brain className="w-4 h-4" />
              <span>SYSTEM PROCESSING...</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span>ACTIVE</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-green-400">LATENCY: {responseTimes.length > 0 ? `${responseTimes[responseTimes.length - 1].latency}ms` : 'N/A'}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden z-10 min-h-0">
        {/* LEFT COLUMN - Chat Feed */}
        <div className="col-span-5 border border-green-800 bg-black/60 backdrop-blur flex flex-col min-h-0">
          <div className="border-b border-green-800 p-2 bg-green-900/20 shrink-0">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              LIVE INTERCEPT
            </h2>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end'} animate-[slideIn_0.3s_ease-out]`}
                style={{
                  animation: `slideIn${msg.role === 'agent' ? 'Left' : 'Right'} 0.3s ease-out`
                }}
              >
                <div className={`max-w-[75%] p-2 rounded ${msg.role === 'agent'
                    ? 'bg-blue-900/30 border border-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'bg-red-900/30 border border-red-700 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  }`}>
                  <div className="text-[10px] opacity-60 mb-1">{msg.role === 'agent' ? 'AI AGENT' : 'SCAMMER'} • {msg.timestamp}</div>
                  <div className="text-sm break-words">{msg.text}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`flex ${typingSource === 'agent' ? 'justify-start' : 'justify-end'}`}>
                <div className="bg-gray-800/50 border border-gray-700 p-2 rounded text-xs">
                  <span className="animate-pulse">●●●</span> {typingSource === 'agent' ? 'AI analyzing...' : 'Scammer typing...'}
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-green-800 grid grid-cols-1 gap-2 bg-black/80 shrink-0">
            <input
              type="text"
              placeholder="TYPE SCAM MESSAGE HERE (YOU ARE THE SCAMMER)..."
              className="w-full bg-black border border-red-500 text-red-500 p-2 text-sm focus:outline-none focus:border-red-400 placeholder-red-900/50"
              onKeyDown={handleManualSubmit}
              disabled={isTyping}
            />
            <button
              onClick={simulateCall}
              className="bg-green-900/30 hover:bg-green-800/50 border border-green-600 text-green-400 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Volume2 size={16} /> RESET SESSION
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - Metrics & Intelligence */}
        <div className="col-span-7 flex flex-col gap-2 overflow-hidden min-h-0">
          {/* Top Row - Gauges and Chart */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            {/* Threat Gauge */}
            <div className="border border-red-800 bg-black/60 backdrop-blur p-3 flex items-center justify-center">
              <CircularGauge value={threatLevel} color="#ef4444" label="THREAT LEVEL" />
            </div>

            {/* Response Time Chart */}
            <div className="border border-green-800 bg-black/60 backdrop-blur p-3 flex flex-col">
              <h3 className="text-xs font-bold mb-2 text-green-400">RESPONSE LATENCY (ms)</h3>
              <ResponseChart />
              <div className="text-center text-xs text-gray-500 mt-1">
                Avg: {responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b.latency, 0) / responseTimes.length) : 0}ms
              </div>
            </div>

            {/* Fatigue Thermometer */}
            <div className="border border-blue-800 bg-black/60 backdrop-blur p-3 flex flex-col items-center justify-center">
              <div className="text-xs font-bold mb-2 text-blue-400">SCAMMER FATIGUE</div>
              <div className="relative w-8 h-32 bg-gray-800 rounded-full overflow-hidden border-2 border-blue-600">
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-purple-600 transition-all duration-500"
                  style={{ height: `${fatigue}%` }}
                />
              </div>
              <div className="text-2xl font-bold text-blue-400 mt-2">{fatigue.toFixed(0)}%</div>
            </div>
          </div>

          {/* Middle Row - Intel Counter and Stats */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="border border-green-800 bg-black/60 backdrop-blur p-3 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500 mb-1">INTEL EXTRACTED</div>
              <div className="text-4xl font-bold text-green-400 animate-pulse">{intelCount}</div>
            </div>
            <div className="border border-green-800 bg-black/60 backdrop-blur p-3 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500 mb-1">TIME WASTED</div>
              <div className="text-2xl font-bold text-green-400">{Math.floor(timeWasted / 60)}m {timeWasted % 60}s</div>
            </div>
            <div className="border border-green-800 bg-black/60 backdrop-blur p-3 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500 mb-1">MONEY SAVED</div>
              <div className="text-2xl font-bold text-green-400">₹{moneySaved.toLocaleString()}</div>
            </div>
          </div>

          {/* Bottom Row - Intelligence and Logs */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
            <div className="border border-green-800 bg-black/60 backdrop-blur p-3 flex flex-col min-h-0">
              <h3 className="text-xs font-bold mb-2 text-green-400 shrink-0">EXTRACTED INTEL</h3>
              <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                {extractedData.map((item, i) => (
                  <div key={i} className="text-xs bg-red-900/20 border border-red-800 p-2 rounded flex justify-between animate-[slideIn_0.3s_ease-out]">
                    <span className="text-red-400 font-bold">{item.key}:</span>
                    <span className="text-red-300 break-all">{item.value}</span>
                  </div>
                ))}
                {extractedData.length === 0 && <div className="text-xs text-gray-600 italic">Waiting for data...</div>}
              </div>
            </div>

            <div className="border border-green-800 bg-black/60 backdrop-blur p-3 flex flex-col min-h-0">
              <h3 className="text-xs font-bold mb-2 text-green-400 shrink-0">SYSTEM LOGS</h3>
              <div ref={logRef} className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] min-h-0">
                {logs.map(log => (
                  <div key={log.id} className={`${log.type === 'crit' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-green-600'}`}>
                    [{new Date().toLocaleTimeString()}] {log.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}
