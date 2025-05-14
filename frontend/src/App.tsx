import React, { useState, useEffect } from 'react';
import api from './api';
import { PollWebSocket } from './components/PollWebSocket';

interface Poll {
  id: string;
  question: string;
  options: string[];
  expiresAt: string;
  votes: Record<string, number>;
}

function App() {
  const [token, setToken] = useState<string>('');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  });

  // Handle real-time vote updates
  const handleVoteUpdate = (pollId: string, votes: Record<string, number>) => {
    setPolls(currentPolls => 
      currentPolls.map(poll => 
        poll.id === pollId ? { ...poll, votes } : poll
      )
    );
  };

  useEffect(() => {
    // Get anonymous token on mount
    const getToken = async () => {
      try {
        const response = await api.post('/api/auth/anon');
        setToken(response.data.token);
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };
    getToken();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await api.get('/api/poll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  // Fetch polls when token is available
  useEffect(() => {
    if (token) {
      fetchPolls();
    }
  }, [token]);

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/poll', newPoll, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchPolls(); // Fetch updated polls after creating new one
      // Reset form
      setNewPoll({
        question: '',
        options: ['', ''],
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      });
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const castVote = async (pollId: string, optionIndex: number, expiresAt: string) => {
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    if (isExpired(expiresAt)) {
      console.error('Cannot vote on expired poll');
      return;
    }

    try {
      console.log('Casting vote:', { pollId, optionIndex, token });
      const response = await api.post(`/api/poll/${pollId}/vote`, 
        { optionIndex },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Vote response:', response.data);
    } catch (error: any) {
      console.error('Error casting vote:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    }
  };

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Polls</h1>
      
      {/* WebSocket connections for each poll */}
      {polls.map(poll => (
        <PollWebSocket 
          key={`ws-${poll.id}`}
          pollId={poll.id}
          onVoteUpdate={(votes) => handleVoteUpdate(poll.id, votes)}
        />
      ))}
      
      {/* Create Poll Form */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl mb-4">Create New Poll</h2>
        <form onSubmit={createPoll}>
          <div className="mb-4">
            <label className="block mb-2">Question:</label>
            <input
              type="text"
              value={newPoll.question}
              onChange={e => setNewPoll({...newPoll, question: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Options:</label>
            {newPoll.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={e => {
                  const newOptions = [...newPoll.options];
                  newOptions[index] = e.target.value;
                  setNewPoll({...newPoll, options: newOptions});
                }}
                className="w-full p-2 border rounded mb-2"
                required
              />
            ))}
            <button
              type="button"
              onClick={addOption}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Option
            </button>
          </div>
          
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Poll
          </button>
        </form>
      </div>

      {/* Active Polls */}
      <div>
        <h2 className="text-xl mb-4">Active Polls</h2>
        {polls.map(poll => {
          const expired = isExpired(poll.expiresAt);
          return (
            <div key={poll.id} className="mb-4 p-4 border rounded">
              <h3 className="font-bold">{poll.question}</h3>
              <div className="mt-2">
                {poll.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => castVote(poll.id, index, poll.expiresAt)}
                    className={`block w-full text-left p-2 mb-2 border rounded ${
                      expired 
                        ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                        : 'hover:bg-gray-100'
                    }`}
                    disabled={expired}
                  >
                    {option} ({poll.votes?.[index] || 0} votes)
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                <p>Expires: {new Date(poll.expiresAt).toLocaleString()}</p>
                {expired && (
                  <p className="text-red-500 mt-1">This poll has expired</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App; 