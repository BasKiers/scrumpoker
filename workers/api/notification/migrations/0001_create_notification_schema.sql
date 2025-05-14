-- User details table (standalone, no foreign keys)
CREATE TABLE IF NOT EXISTS user_details (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- GitHub accounts table
CREATE TABLE IF NOT EXISTS github_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  github_id INTEGER UNIQUE NOT NULL,
  login TEXT NOT NULL,
  access_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- GitHub repositories table
CREATE TABLE IF NOT EXISTS github_repositories (
  id TEXT PRIMARY KEY,
  github_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  private BOOLEAN NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- GitHub account repository associations
CREATE TABLE IF NOT EXISTS github_account_repositories (
  github_account_id TEXT NOT NULL,
  repository_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (github_account_id, repository_id),
  FOREIGN KEY (github_account_id) REFERENCES github_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (repository_id) REFERENCES github_repositories(id) ON DELETE CASCADE
);

-- Repository branches table
CREATE TABLE IF NOT EXISTS repository_branches (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (repository_id) REFERENCES github_repositories(id) ON DELETE CASCADE,
  UNIQUE (repository_id, name)
);

-- Pull requests table
CREATE TABLE IF NOT EXISTS pull_requests (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL,
  github_id INTEGER NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  head_branch_id TEXT NOT NULL,
  base_branch_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (repository_id) REFERENCES github_repositories(id) ON DELETE CASCADE,
  FOREIGN KEY (head_branch_id) REFERENCES repository_branches(id) ON DELETE CASCADE,
  FOREIGN KEY (base_branch_id) REFERENCES repository_branches(id) ON DELETE CASCADE,
  UNIQUE (repository_id, github_id)
);

-- Notification channels table
CREATE TABLE IF NOT EXISTS notification_channels (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSON NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Branch notification triggers table
CREATE TABLE IF NOT EXISTS branch_notification_triggers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  event_filter JSON NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Branch trigger repository associations
CREATE TABLE IF NOT EXISTS branch_trigger_repositories (
  trigger_id TEXT NOT NULL,
  repository_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (trigger_id, repository_id),
  FOREIGN KEY (trigger_id) REFERENCES branch_notification_triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (repository_id) REFERENCES github_repositories(id) ON DELETE CASCADE
);

-- Branch trigger branch associations
CREATE TABLE IF NOT EXISTS branch_trigger_branches (
  trigger_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (trigger_id, branch_id),
  FOREIGN KEY (trigger_id) REFERENCES branch_notification_triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES repository_branches(id) ON DELETE CASCADE
);

-- Branch trigger channel associations
CREATE TABLE IF NOT EXISTS branch_trigger_channels (
  trigger_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (trigger_id, channel_id),
  FOREIGN KEY (trigger_id) REFERENCES branch_notification_triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (channel_id) REFERENCES notification_channels(id) ON DELETE CASCADE
);

-- Pull request notification triggers table
CREATE TABLE IF NOT EXISTS pr_notification_triggers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  event_filter JSON NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- PR trigger repository associations
CREATE TABLE IF NOT EXISTS pr_trigger_repositories (
  trigger_id TEXT NOT NULL,
  repository_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (trigger_id, repository_id),
  FOREIGN KEY (trigger_id) REFERENCES pr_notification_triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (repository_id) REFERENCES github_repositories(id) ON DELETE CASCADE
);

-- PR trigger branch associations
CREATE TABLE IF NOT EXISTS pr_trigger_branches (
  trigger_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (trigger_id, branch_id),
  FOREIGN KEY (trigger_id) REFERENCES pr_notification_triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES repository_branches(id) ON DELETE CASCADE
);

-- PR trigger channel associations
CREATE TABLE IF NOT EXISTS pr_trigger_channels (
  trigger_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (trigger_id, channel_id),
  FOREIGN KEY (trigger_id) REFERENCES pr_notification_triggers(id) ON DELETE CASCADE,
  FOREIGN KEY (channel_id) REFERENCES notification_channels(id) ON DELETE CASCADE
); 