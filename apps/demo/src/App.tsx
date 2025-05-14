import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './trpc';
import { Box, Container, Paper, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/trpc',
    }),
  ],
});

function AppContent() {
  const [name, setName] = useState('');
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const hello = trpc.hello.useQuery({ name }, {
    enabled: false,
  });

  useEffect(() => {
    // Connect to WebSocket
    const socket = new WebSocket(`ws://${window.location.host}/ws/demo`);
    
    socket.onmessage = (event) => {
      setWsMessages((prev) => [...prev, event.data]);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', content: 'Hello from client!' }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          tRPC Test
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => hello.refetch()}
            disabled={hello.isFetching}
          >
            Test Hello
          </Button>
        </Box>
        {hello.data && (
          <Typography variant="body1">
            Response: {hello.data.greeting}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          WebSocket Test
        </Typography>
        <Button
          variant="contained"
          onClick={handleSendMessage}
          sx={{ mb: 2 }}
        >
          Send Test Message
        </Button>
        <List>
          {wsMessages.map((message, index) => (
            <ListItem key={index}>
              <ListItemText primary={message} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
} 