import { useState, useEffect, useCallback, useRef } from 'react';

export interface AgentLog {
  type: 'log' | 'reasoning' | 'node_update' | 'progress' | 'error' | 'complete';
  agent?: string;
  message: string;
  data?: any;
  timestamp: string;
}

export interface ProcessingNode {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  agent: string;
  children?: string[];
}

export interface ProcessingProgress {
  progress: number;
  stage: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  logs: AgentLog[];
  nodes: ProcessingNode[];
  progress: ProcessingProgress | null;
  isComplete: boolean;
  results: any;
  startProcessing: (fileInfo: any) => void;
  clearLogs: () => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3002/ws';

export function useAgentWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [nodes, setNodes] = useState<ProcessingNode[]>([]);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);
  const isConnectingRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
      return;
    }
    
    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        isConnectingRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('[WebSocket] Parse error:', error);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        isConnectingRef.current = false;
        wsRef.current = null;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        isConnectingRef.current = false;
      };
    } catch (err) {
      isConnectingRef.current = false;
    }
  }, []);

  const handleMessage = (data: any) => {
    console.log('[WebSocket] Received message type:', data.type, data);
    
    switch (data.type) {
      case 'init':
        console.log('[WebSocket] Init received, logs:', data.logs?.length, 'nodes:', data.nodes?.length);
        setLogs(data.logs || []);
        setNodes(data.nodes || []);
        break;
      
      case 'log':
      case 'reasoning':
      case 'tool_call':
      case 'tool_result':
      case 'data':
        console.log('[WebSocket] Adding log:', data.message?.substring(0, 50));
        setLogs(prev => [...prev, {
          type: data.type,
          agent: data.agent || 'system',
          message: data.message || JSON.stringify(data.data || data),
          timestamp: data.timestamp || new Date().toISOString(),
        } as AgentLog]);
        break;
      
      case 'nodes':
        console.log('[WebSocket] Nodes update:', data.data?.length, 'nodes');
        setNodes(data.data || []);
        break;
      
      case 'node_update':
        setLogs(prev => [...prev, data as AgentLog]);
        break;
      
      case 'progress':
        console.log('[WebSocket] Progress:', data.data);
        setProgress(data.data);
        break;
      
      case 'complete':
        console.log('[WebSocket] Complete! Full data:', data);
        console.log('[WebSocket] Stats received:', data.data?.stats);
        setIsComplete(true);
        setResults(data.data);
        setLogs(prev => [...prev, {
          type: 'complete',
          agent: 'system',
          message: 'Processing complete',
          timestamp: new Date().toISOString(),
        } as AgentLog]);
        break;
      
      case 'error':
        console.log('[WebSocket] Error:', data);
        setLogs(prev => [...prev, data as AgentLog]);
        break;
        
      default:
        console.log('[WebSocket] Unknown message type:', data.type);
    }
  };

  const startProcessing = useCallback((fileInfo: any) => {
    setLogs([]);
    setNodes([]);
    setProgress(null);
    setIsComplete(false);
    setResults(null);
    sessionIdRef.current = `session_${Date.now()}`;

    const message = {
      type: 'start_processing',
      sessionId: sessionIdRef.current,
      data: {
        name: fileInfo?.name || 'document.csv',
        content: fileInfo?.content || '',
        query: fileInfo?.query || 'Validate provider data',
      },
    };

    console.log('[WebSocket] Attempting to send:', message.type);
    console.log('[WebSocket] Connection state:', wsRef.current?.readyState, '(0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)');
    console.log('[WebSocket] File content length:', message.data.content?.length || 0);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('[WebSocket] Message sent successfully!');
      
      setLogs([{
        type: 'log',
        agent: 'system',
        message: `Starting processing: ${message.data.query}`,
        timestamp: new Date().toISOString(),
      }]);
    } else {
      console.error('[WebSocket] Cannot send - not connected! State:', wsRef.current?.readyState);
      connect();
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(message));
          console.log('[WebSocket] Message sent after reconnect!');
        } else {
          console.error('[WebSocket] Still not connected after retry');
        }
      }, 1000);
    }
  }, [connect]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setNodes([]);
    setProgress(null);
    setIsComplete(false);
    setResults(null);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    isConnected,
    logs,
    nodes,
    progress,
    isComplete,
    results,
    startProcessing,
    clearLogs,
  };
}

export default useAgentWebSocket;
