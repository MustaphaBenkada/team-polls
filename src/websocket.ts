import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import pool from './db';

interface WebSocketWithPollId extends WebSocket {
  pollId?: string;
}

interface VerifyClientInfo {
  origin: string;
  req: IncomingMessage;
  secure: boolean;
}

// Global variables for WebSocket functionality
let wsClients: Map<string, WebSocket[]>;
let broadcastInterval: NodeJS.Timeout;

export async function broadcastTally(pollId: string) {
  if (!wsClients) return; // If WebSocket server hasn't been initialized yet

  try {
    const tallyResult = await pool.query(
      'SELECT option_index, COUNT(*) FROM votes WHERE poll_id = $1 GROUP BY option_index ORDER BY option_index',
      [pollId]
    );
    const pollOptionsResult = await pool.query('SELECT options FROM polls WHERE id = $1', [pollId]);
    
    if (pollOptionsResult.rows.length > 0) {
      const options = pollOptionsResult.rows[0].options;
      const votes = options.reduce((acc: Record<string, number>, _: string, index: number) => {
        const vote = tallyResult.rows.find((row) => row.option_index === index);
        acc[index] = parseInt(vote?.count || '0');
        return acc;
      }, {});
      
      const message = JSON.stringify({ 
        type: 'tally_update', 
        votes,
        timestamp: new Date().toISOString()
      });

      const clientsForPoll = wsClients.get(pollId) || [];
      clientsForPoll.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  } catch (error) {
    console.error('Error broadcasting tally:', error);
    // Don't close connections on broadcast error
  }
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    verifyClient: (info: VerifyClientInfo, callback) => {
      // Accept all connections in development
      console.log('WebSocket connection attempt:', {
        origin: info.origin,
        url: info.req.url,
        headers: info.req.headers
      });
      callback(true);
    }
  });
  
  // Initialize global clients map
  wsClients = new Map<string, WebSocket[]>();

  wss.on('connection', (ws: WebSocketWithPollId, req) => {
    console.log('WebSocket connection established:', {
      url: req.url,
      headers: req.headers,
      remoteAddress: req.socket.remoteAddress
    });

    // Fix URL parsing to handle the full path correctly
    const urlParts = req.url?.split('/').filter(Boolean);
    console.log('URL parts:', urlParts);
    
    // Extract poll ID from URL
    const pollId = urlParts?.[urlParts.length - 1];
    console.log('Extracted poll ID:', pollId);
    
    // Validate poll ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!pollId || !uuidRegex.test(pollId)) {
      console.error('Invalid poll ID format:', pollId);
      ws.close(1003, 'Invalid poll ID format');
      return;
    }

    ws.pollId = pollId;

    // Store client connection
    if (!wsClients.has(pollId)) {
      wsClients.set(pollId, []);
    }
    wsClients.get(pollId)?.push(ws);
    console.log(`Client connected to poll ${pollId}, total clients: ${wsClients.get(pollId)?.length}`);

    // Send initial tally
    broadcastTally(pollId).catch(error => {
      console.error(`Error broadcasting initial tally for poll ${pollId}:`, error);
    });

    // Setup event handlers
    ws.on('close', (code, reason) => {
      console.log(`WebSocket closed for poll ${pollId}:`, {
        code,
        reason: reason.toString(),
        remainingClients: wsClients.get(pollId)?.length
      });
      
      wsClients.set(pollId, wsClients.get(pollId)?.filter(client => client !== ws) || []);
      if (wsClients.get(pollId)?.length === 0) {
        wsClients.delete(pollId);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for poll ${pollId}:`, {
        error,
        errorMessage: error.message,
        errorStack: error.stack
      });
      ws.close(1011, 'Internal server error');
    });

    // Ping/Pong to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    ws.on('pong', () => {
      console.log(`Received pong from client for poll ${pollId}`);
    });
  });

  // Broadcast updates every second
  broadcastInterval = setInterval(() => {
    for (const [pollId] of wsClients.entries()) {
      if (pollId && pollId !== 'poll') {
        broadcastTally(pollId).catch(error => {
          console.error(`Error broadcasting tally for poll ${pollId}:`, error);
        });
      }
    }
  }, 1000);

  // Clean up interval on server close
  server.on('close', () => {
    if (broadcastInterval) {
      clearInterval(broadcastInterval);
    }
  });

  return wss;
}