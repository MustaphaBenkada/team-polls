import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import pool from './db';

interface WebSocketWithPollId extends WebSocket {
  pollId?: string;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });
  const clients = new Map<string, WebSocket[]>(); // pollId -> [clients]

  wss.on('connection', (ws: WebSocketWithPollId, req) => {
    const pollId = req.url?.split('/')[2];
    if (!pollId) {
      console.error('WebSocket connection missing poll ID');
      ws.close();
      return;
    }
    ws.pollId = pollId;

    if (!clients.has(pollId)) {
      clients.set(pollId, []);
    }
    clients.get(pollId)?.push(ws);
    console.log(`Client connected to poll ${pollId}, total clients: ${clients.get(pollId)?.length}`);

    ws.on('close', () => {
      clients.set(pollId, clients.get(pollId)?.filter(client => client !== ws) || []);
      console.log(`Client disconnected from poll ${pollId}, remaining clients: ${clients.get(pollId)?.length}`);
      if (clients.get(pollId)?.length === 0) {
        clients.delete(pollId);
      }
    });
  });

  const broadcastTally = async (pollId: string) => {
    try {
      const tallyResult = await pool.query(
        'SELECT option_index, COUNT(*) FROM votes WHERE poll_id = $1 GROUP BY option_index ORDER BY option_index',
        [pollId]
      );
      const pollOptionsResult = await pool.query('SELECT options FROM polls WHERE id = $1', [pollId]);
      if (pollOptionsResult.rows.length > 0) {
        const options = pollOptionsResult.rows[0].options;
        const tally = options.map((_: string, index: number) => {
          const vote = tallyResult.rows.find((row) => row.option_index === index);
          return parseInt(vote?.count || '0');
        });
        const message = JSON.stringify({ type: 'tally_update', tally });
        clients.get(pollId)?.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      console.error('Error broadcasting tally:', error);
    }
  };

  setInterval(() => {
    clients.forEach((_, pollId: string) => { // Explicitly typed parameter
      broadcastTally(pollId);
    });
  }, 1000);

  return wss;
}