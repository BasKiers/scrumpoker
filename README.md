# GitHub Notifier

A monorepo containing various applications and packages for GitHub notifications.

## Project Structure

```
github-notifier/
├── apps/                    # Application projects
│   ├── chrome-extension/    # Chrome extension
│   ├── desktop-app/         # Electron-based desktop app
│   └── slack-bot/          # Slack bot
├── packages/               # Shared packages
│   ├── core/              # Core functionality
│   ├── types/             # Shared TypeScript types
│   └── ui/                # Shared UI components
└── workers/               # Cloudflare Workers
    ├── api/               # Main API worker
    └── webhook/           # Webhook handler worker
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development:
   ```bash
   pnpm nx run-many --target=serve --all
   ```

## Available Scripts

- `pnpm format` - Format all files with Prettier
- `pnpm lint` - Lint all files with ESLint
- `pnpm test` - Run tests for all projects

## Development

This project uses NX for managing the monorepo. Each project in the `apps/` and `packages/` directories is managed independently but can share code through the packages in the `packages/` directory.

### Adding a new project

```bash
pnpm nx g @nx/js:lib my-lib
```

### Running a specific project

```bash
pnpm nx serve my-app
``` 