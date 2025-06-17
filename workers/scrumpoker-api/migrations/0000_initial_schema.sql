-- Migration: Initial Schema
-- Description: Creates the initial tables for room state and participants

CREATE TABLE IF NOT EXISTS room_state (
    room_id TEXT PRIMARY KEY,
    card_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participants (
    user_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    name TEXT,
    selected_card TEXT,
    last_event_timestamp INTEGER,
    PRIMARY KEY (user_id, room_id),
    FOREIGN KEY (room_id) REFERENCES room_state(room_id)
); 