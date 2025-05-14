import { useEffect, useCallback, useRef } from 'react';

interface PollWebSocketProps {
  pollId: string;
  onVoteUpdate: (votes: Record<string, number>) => void;
}

export function PollWebSocket({ pollId, onVoteUpdate }: PollWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const lastMessageRef = useRef<string>('');
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`WebSocket already connected for poll ${pollId}`);
      return;
    }

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error(`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached for poll ${pollId}`);
      return;
    }

    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Use the environment variable for WebSocket URL
      const wsUrl = `${import.meta.env.VITE_WS_URL}/poll/${pollId}`;
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected successfully for poll ${pollId}`);
        reconnectAttemptsRef.current = 0; // Reset counter on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Check for duplicate messages
          const messageKey = `${data.type}-${data.timestamp}`;
          if (messageKey === lastMessageRef.current) {
            return; // Skip duplicate message
          }
          lastMessageRef.current = messageKey;

          if (data.type === 'tally_update') {
            onVoteUpdate(data.votes);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for poll ${pollId}:`, error);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed for poll ${pollId}. Code: ${event.code}, Reason: ${event.reason}`);
        wsRef.current = null;
        
        // Only attempt to reconnect if we haven't reached the maximum attempts
        // and the component is still mounted (reconnectTimeoutRef exists)
        if ((event.code === 1006 || event.code === 1005) && reconnectTimeoutRef.current) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          console.log(
            `WebSocket connection closed for poll ${pollId}. ` +
            `Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}. ` +
            `Reconnecting in ${delay/1000} seconds...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              connect();
            }
          }, delay);
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }, [pollId, onVoteUpdate]);

  useEffect(() => {
    console.log(`Setting up WebSocket for poll ${pollId}`);
    connect();

    return () => {
      console.log(`Cleaning up WebSocket for poll ${pollId}`);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined; // Mark as unmounted
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      reconnectAttemptsRef.current = 0;
      lastMessageRef.current = '';
    };
  }, [connect]);

  return null;
} 