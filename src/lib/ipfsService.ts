import lighthouse from '@lighthouse-web3/sdk';

export interface ProjectData {
  budget: string;
  projectTitle: string;
  startDate: string;
  totalDuration: string;
  localPresident: string;
  location: string;
  projectDescription: string;
  initialFundReleaseAmount: string;
  pinCode: string;
  createdBy: string;
  timestamp: number;
}

export interface SignatureResult {
  signature: string;
  message: string;
  address: string;
}

export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}

class IPFSService {
  private apiKey: string;

  constructor() {
    // You'll need to get this from Lighthouse dashboard
    this.apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Lighthouse API key is not set. Please set NEXT_PUBLIC_LIGHTHOUSE_API_KEY in your environment variables.');
    }
  }

  /**
   * Connect to MetaMask and get user's address
   */
  async connectMetaMask(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      return accounts[0];
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      }
      throw new Error(`Failed to connect to MetaMask: ${error.message}`);
    }
  }

  /**
   * Sign a message with MetaMask
   */
  async signMessage(message: string, address: string): Promise<SignatureResult> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed.');
    }

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      return {
        signature,
        message,
        address
      };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the signature request.');
      }
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * Upload project data to IPFS using Lighthouse
   */
  async uploadProjectToIPFS(projectData: ProjectData): Promise<IPFSUploadResult> {
    if (!this.apiKey) {
      throw new Error('Lighthouse API key is not configured. Please set NEXT_PUBLIC_LIGHTHOUSE_API_KEY in your environment variables.');
    }

    try {
      // Convert project data to JSON string
      const jsonData = JSON.stringify(projectData, null, 2);
      console.log('Project data to upload:', jsonData);
      
      // Create a Blob from the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });
      console.log('Blob created:', blob);
      
      // Create a File object from the Blob
      const file = new File([blob], `project-${Date.now()}.json`, {
        type: 'application/json'
      });
      console.log('File created:', file);

      // Ensure we have a valid file array
      const files = [file];
      console.log('Files array:', files);

      // Upload to IPFS using Lighthouse
      console.log('Attempting to upload to Lighthouse with API key:', this.apiKey ? 'Set' : 'Not set');
      const output = await lighthouse.upload(files, this.apiKey);
      
      console.log('Lighthouse upload response:', output);
      
      // Handle different response structures
      let hash: string;
      let size: number = 0;
      
      // Type assertion to handle the response structure
      const response = output as any;
      
      if (response && response.data && response.data.Hash) {
        // Response structure: { data: { Hash: string, Size: number } }
        hash = response.data.Hash;
        size = typeof response.data.Size === 'number' ? response.data.Size : 0;
      } else if (response && response.Hash) {
        // Direct response structure: { Hash: string, Size: number }
        hash = response.Hash;
        size = typeof response.Size === 'number' ? response.Size : 0;
      } else if (Array.isArray(response) && response.length > 0 && response[0].Hash) {
        // Array response structure: [{ Hash: string, Size: number }]
        hash = response[0].Hash;
        size = typeof response[0].Size === 'number' ? response[0].Size : 0;
      } else {
        console.error('Unexpected Lighthouse response structure:', response);
        throw new Error('Upload failed: Unexpected response structure from Lighthouse');
      }
      
      return {
        hash,
        url: `https://gateway.lighthouse.storage/ipfs/${hash}`,
        size
      };
    } catch (error: any) {
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Test Lighthouse connection
   */
  async testLighthouseConnection(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error('Lighthouse API key is not configured');
      }

      // Create a simple test file
      const testData = { test: 'connection', timestamp: Date.now() };
      const jsonData = JSON.stringify(testData);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const file = new File([blob], 'test.json', { type: 'application/json' });

      console.log('Testing Lighthouse connection...');
      const output = await lighthouse.upload([file], this.apiKey);
      console.log('Lighthouse test response:', output);
      
      return true;
    } catch (error: any) {
      console.error('Lighthouse connection test failed:', error);
      return false;
    }
  }

  /**
   * Complete project creation flow: Connect wallet, sign message, upload to IPFS
   */
  async createProjectWithSignature(projectData: Omit<ProjectData, 'createdBy' | 'timestamp'>): Promise<{
    signature: SignatureResult;
    ipfsResult: IPFSUploadResult;
    projectData: ProjectData;
  }> {
    try {
      // Step 1: Connect to MetaMask
      const address = await this.connectMetaMask();
      console.log('Connected to MetaMask:', address);

      // Step 2: Prepare project data with metadata
      const fullProjectData: ProjectData = {
        ...projectData,
        createdBy: address,
        timestamp: Date.now()
      };

      // Step 3: Create message to sign
      const message = `I am creating a new project "${projectData.projectTitle}" with budget $${projectData.budget} on GramChain. This signature confirms my authorization for this project creation.`;
      
      // Step 4: Sign the message
      const signature = await this.signMessage(message, address);
      console.log('Message signed:', signature);

      // Step 5: Upload to IPFS
      const ipfsResult = await this.uploadProjectToIPFS(fullProjectData);
      console.log('Project uploaded to IPFS:', ipfsResult);

      return {
        signature,
        ipfsResult,
        projectData: fullProjectData
      };
    } catch (error: any) {
      console.error('Project creation failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve project data from IPFS
   */
  async getProjectFromIPFS(hash: string): Promise<ProjectData> {
    try {
      const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${hash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project data: ${response.statusText}`);
      }
      
      const projectData = await response.json();
      return projectData;
    } catch (error: any) {
      throw new Error(`Failed to retrieve project from IPFS: ${error.message}`);
    }
  }
}

export const ipfsService = new IPFSService();
