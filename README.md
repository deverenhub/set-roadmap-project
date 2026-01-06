# SET VPC Interactive Roadmap Platform

An AI-powered interactive roadmap platform for Southeast Toyota Vehicle Processing Centers transformation initiative.

## Features

- **Dashboard**: Real-time KPIs, progress tracking, and activity feed
- **Capability Management**: Track and manage operational capabilities with maturity levels (1-5)
- **Timeline Visualization**: Interactive Gantt charts with Path A/B/C scenarios
- **Dependency Diagrams**: Visual dependency flow using React Flow
- **Quick Wins Kanban**: Drag-and-drop board for short-term initiatives
- **AI Chat Assistant**: Natural language queries powered by MCP (Model Context Protocol)
- **Real-time Updates**: Live synchronization across all users

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: TanStack Query, Zustand
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Supabase Edge Functions with MCP
- **Diagrams**: React Flow, Recharts
- **Testing**: Vitest, Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/set-roadmap-platform.git
   cd set-roadmap-platform
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Set up database:
   ```bash
   pnpm supabase db push
   pnpm supabase db seed
   ```

6. Deploy edge functions:
   ```bash
   pnpm supabase functions deploy mcp-server
   ```

7. Start development server:
   ```bash
   pnpm dev
   ```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Base UI components (shadcn/ui)
│   ├── dashboard/    # Dashboard-specific components
│   ├── capabilities/ # Capability management components
│   ├── diagrams/     # React Flow and chart components
│   ├── quickwins/    # Kanban board components
│   ├── chat/         # AI chat interface
│   └── shared/       # Shared utilities (ErrorBoundary, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and Supabase client
├── pages/            # Page components
├── stores/           # Zustand stores
└── types/            # TypeScript definitions

supabase/
├── functions/        # Edge functions (MCP server)
├── migrations/       # Database migrations
└── seed.sql          # Seed data
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm lint` - Lint code
- `pnpm format` - Format code

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables
3. Deploy

### Manual

```bash
pnpm build
# Deploy dist/ folder to your hosting provider
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For questions or issues, contact TSVMap Consulting Services.
