import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { humanId } from 'human-id';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');

  const createRoom = () => {
    const roomId = humanId({ 
      separator: '-',
      capitalize: false,
      adjectiveCount: 1,
      addAdverb: true
    });
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedRoomId = joinRoomId.trim();
    if (!trimmedRoomId) {
      setError('Please enter a room ID');
      return;
    }

    const roomIdWithoutWhitespace = trimmedRoomId.replace(/\s+/g, '-');

    // Validate that the room ID contains only URL-safe characters
    const urlSafePattern = /^[a-zA-Z0-9\-_~.]+$/;
    if (!urlSafePattern.test(roomIdWithoutWhitespace)) {
      setError('Room ID can only contain letters, numbers, and the following characters: - _ ~ .');
      return;
    }

    navigate(`/room/${roomIdWithoutWhitespace}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <section className="flex flex-col items-center justify-center text-center space-y-8 py-16">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Collaborative Story Point Estimation
          </h1>
          <p className="max-w-[700px] text-muted-foreground text-lg sm:text-xl">
            Create a room to start estimating story points with your team. Simple, fast, and effective.
          </p>
          <div className="flex flex-col items-center space-y-4 w-full max-w-md">
            <Button 
              size="lg" 
              onClick={createRoom}
              className="text-lg px-8 py-6 w-full"
            >
              Create Room
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or join an existing room
                </span>
              </div>
            </div>
            <form onSubmit={handleJoinRoom} className="w-full space-y-4">
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button 
                type="submit"
                className="w-full"
                disabled={!joinRoomId.trim()}
              >
                Join Room
              </Button>
            </form>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Real-time Collaboration</h3>
            <p className="text-muted-foreground">
              Work together with your team in real-time, no matter where you are.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Fast & Simple</h3>
            <p className="text-muted-foreground">
              Get started in seconds with our intuitive interface.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold">No Account Required</h3>
            <p className="text-muted-foreground">
              Start estimating immediately without any sign-up process.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Works Everywhere</h3>
            <p className="text-muted-foreground">
              Access from any device with a modern web browser.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
