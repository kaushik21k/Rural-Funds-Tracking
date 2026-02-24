# Rural Funds Tracking (GramChain)

GramChain is a full-stack web app for transparent management of rural development funds. It combines role-based operations, transaction visibility, wallet connection support, and backend authentication APIs.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [MetaMask Setup](#metamask-setup)
- [Backend API Summary](#backend-api-summary)
- [Blockchain Workspace](#blockchain-workspace)
- [Troubleshooting](#troubleshooting)

## Overview

The platform is designed for tracking project funds from allocation to spending with different user roles:

- Government
- Local Authority
- Contractor
- Public

It includes:

- A Next.js frontend dashboard and workflows
- An Express + MongoDB backend for auth and data endpoints
- Wallet connection via RainbowKit/Wagmi (MetaMask supported)
- Local simulated blockchain transaction/project state in browser storage
- A Hardhat workspace for smart contract experimentation

## Features

- Role-based login and protected workflows
- Fund allocation UI with project linking
- Milestone submission and project monitoring
- Transaction history and dashboard analytics
- MongoDB Atlas connectivity for backend API
- Wallet connect button (RainbowKit), including MetaMask support

## Architecture

### Frontend

- Built in Next.js 13 App Router (`app/`)
- Core feature components under `src/components/`
- Wallet providers configured in `src/providers.tsx`
- Local state persistence for simulated on-chain data in `useBlockchain`

### Backend

- Express server in `backend/server.js`
- Routes for auth/users/projects in `backend/routes/`
- JWT auth middleware in `backend/middleware/auth.js`
- MongoDB models in `backend/models/`

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Radix UI
- Wallets/Web3: RainbowKit, Wagmi, Viem
- Backend: Node.js, Express, Mongoose, JWT, bcrypt
- Database: MongoDB Atlas
- Smart Contracts: Hardhat (workspace in `src/blockchain`)

## Folder Structure

```text
app/                  # Next.js pages/routes
src/components/       # Dashboard and feature components
src/hooks/            # Custom hooks (including local blockchain simulation)
src/lib/              # API and IPFS helpers
src/providers.tsx     # Wagmi + RainbowKit providers and connect button
backend/              # Express backend API
src/blockchain/       # Hardhat contracts, scripts, artifacts
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account + cluster
- MetaMask browser extension (for wallet connection)

## Environment Variables

Create `backend/.env` with:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?appName=Cluster0
PORT=8080
NODE_ENV=development
JWT_SECRET=change_this_secret
JWT_EXPIRE=7d
```

## Installation

From workspace root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Optional (smart contracts):

```bash
cd ../src/blockchain
npm install
```

## Running the Project

Start backend (Terminal 1):

```bash
cd backend
npm run dev
```

Start frontend (Terminal 2):

```bash
cd ..
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8080/api/health`

## MetaMask Setup

This project already includes wallet connection using RainbowKit and Wagmi. You can connect MetaMask from the app UI.

### 1) Install MetaMask

- Add MetaMask extension in your browser.
- Create/import a wallet and securely store seed phrase.

### 2) Open the app and connect wallet

- Run frontend (`npm run dev`) and open `http://localhost:3000`.
- Click **Connect Wallet** in the dashboard/header area.
- Choose **MetaMask** and approve connection.

### 3) Select supported chain

Current wallet provider config includes:

- BNB Smart Chain Testnet (preferred for testing)
- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum
- Base

If MetaMask prompts network switch, approve it.

### 4) Add BSC Testnet manually (if needed)

Use these values in MetaMask network settings:

- Network Name: `BNB Smart Chain Testnet`
- RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545/`
- Chain ID: `97`
- Currency Symbol: `tBNB`
- Block Explorer: `https://testnet.bscscan.com`

### 5) Important note about current blockchain behavior

Wallet connection is live, but most fund/project transactions in current UI are simulated via local storage (`src/hooks/useBlockchain.ts`) and are not yet submitted as real on-chain transactions.

## Backend API Summary

Base URL: `http://localhost:8080`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/verify-token`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/users/role/:role`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id/allocate`
- `PUT /api/projects/:id/approve-payment`
- `POST /api/projects/:id/milestones`
- `GET /api/projects/:id/transactions`

## Blockchain Workspace

Smart contract workspace is available in `src/blockchain/`.

Useful commands:

```bash
cd src/blockchain
npx hardhat compile
npx hardhat test
npx hardhat node
```

## Troubleshooting

- `EADDRINUSE: 8080`: another process already uses port 8080. Stop that process or change `PORT` in `backend/.env`.
- MongoDB connection errors: verify `MONGODB_URI`, database user/password, and Atlas IP whitelist.
- Wallet not connecting: ensure MetaMask is unlocked and allowed for the active browser tab.
- Frontend Select runtime error (`Select.Item value empty`): already fixed in `src/components/FundAllocation.tsx` by using a non-empty fallback value.
