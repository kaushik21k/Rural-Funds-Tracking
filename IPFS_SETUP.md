# GramChain - IPFS Integration Setup

## Lighthouse IPFS Setup

To enable IPFS storage for project data, you need to:

1. **Get a Lighthouse API Key:**
   - Visit [Lighthouse Storage](https://lighthouse.storage/)
   - Sign up for an account
   - Generate an API key from the dashboard

2. **Set Environment Variable:**
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
   ```

3. **Restart the Development Server:**
   ```bash
   npm run dev
   ```

## Features

- **MetaMask Integration:** Users must connect their MetaMask wallet
- **Message Signing:** Users sign a message to authenticate project creation
- **IPFS Storage:** Project data is stored on IPFS via Lighthouse
- **Blockchain Integration:** Project metadata is stored locally with IPFS hash reference

## Usage

1. Click "Create Project" button
2. Fill in the project form
3. Click "Create Project" - this will:
   - Connect to MetaMask
   - Request signature for authentication
   - Upload project data to IPFS
   - Store project in local blockchain state

## Error Handling

The system handles various error scenarios:
- MetaMask not installed
- User rejects connection/signature
- IPFS upload failures
- Network connectivity issues
