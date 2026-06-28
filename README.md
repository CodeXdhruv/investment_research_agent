# 🧠 StocksForge AI Engine (Backend API)

**GitHub Repository:** [https://github.com/CodeXdhruv/investment_research_agent](https://github.com/CodeXdhruv/investment_research_agent)

Welcome to the core backend repository for **StocksForge**. This is a decoupled Next.js API ecosystem that orchestrates financial data aggregation and drives the LangChain Multi-Agent AI workflows.

## 🏗️ Core Architecture

Rather than relying on standard LLM single-prompt bias, this engine utilizes a **Multi-Agent Debate Mechanism**. It spawns isolated `Bull` and `Bear` agents that parse real-time financial data concurrently. Their inherently biased arguments are then synthesized by a `Master` agent to determine a highly accurate, unbiased "Fair Value" for any given equity.

## 🚀 Technology Stack

*   **Runtime:** Node.js / Next.js Serverless API Routes (`/api/v1/...`)
*   **Database:** Neon Serverless PostgreSQL
*   **ORM:** Prisma (with `pgvector` support)
*   **AI Orchestration:** LangChain (TypeScript SDK)
*   **LLM Engine:** Gemma 4 Model
*   **Data Providers:** Finnhub, Financial Modeling Prep (FMP), Reddit API

## ⚙️ Quick Start Setup

You must configure your `.env` and `.env.local` files with the necessary API keys (Neon Postgres string, Clerk Secret, Finnhub, FMP, and Gemma 4) before initializing.

```bash
# 1. Install dependencies
npm install

# 2. Initialize and sync the database schema
npx prisma generate
npx prisma db push

# 3. Run the backend development server
npm run dev
```

The backend API server runs on `http://localhost:3001` by default.

## 🛡️ Smart Optimizations

This API is highly hardened against severe rate-limits:
*   **Promise Deduplication (The Thundering Herd Fix):** Prevents redundant external API calls during high-concurrency user spikes, locking inflight promises so 50 users only trigger 1 API call.
*   **TTL Caching:** Implements an in-memory Time-to-Live caching layer with graceful degradation (fallback to stale data) to prevent UI crashes during provider outages.

---
*For a comprehensive breakdown of the entire architecture, database schemas, and AI workflows, please refer to the `detailed_technical_report.md` in the root workspace.*
