# Rural Funds Tracking (GramChain)

A full-stack platform to track rural fund allocation with role-based workflows, blockchain-style transaction visibility, and MongoDB-backed authentication APIs.

## Tech Stack

- Frontend: Next.js 13, React, TypeScript, Tailwind CSS, Radix UI
- Backend: Node.js, Express, MongoDB (Mongoose), JWT Authentication
- Additional: IPFS helpers and blockchain contract workspace under `src/blockchain/`

## Project Structure

- `app/` - Next.js app routes
- `src/components/` - UI and feature components
- `src/hooks/` - app hooks (`useBlockchain`, `use-toast`)
- `src/lib/` - API/IPFS utilities
- `backend/` - Express API with auth, users, projects routes
- `src/blockchain/` - smart contract and Hardhat workspace

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection string

## Environment Setup

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=8080
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## Install Dependencies

At workspace root:

```bash
npm install
```

For backend:

```bash
cd backend
npm install
```

## Run the App

Start backend:

```bash
cd backend
npm run dev
```

Start frontend (new terminal):

```bash
cd ..
npm run dev
```

Frontend URL: `http://localhost:3000`

## Current Status

- MongoDB Atlas connectivity configured and verified.
- Git repository connected to: `https://github.com/kaushik21k/Rural-Funds-Tracking.git`

## License

MIT
