-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sessionId TEXT PRIMARY KEY,
  lastActivity INTEGER NOT NULL
); 