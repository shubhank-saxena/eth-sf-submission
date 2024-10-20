import express from 'express';
import cors from 'cors';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { LIT_RPC } from '@lit-protocol/constants';

// Load environment variables from .env file
dotenv.config();

// Initialize Express
const app = express();

// Enable CORS for all origins (adjust as needed for production)
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this frontend origin
  methods: ['GET', 'POST'], // Allow only GET and POST methods
  allowedHeaders: ['Content-Type'], // Allow only Content-Type header
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Environment Variables
const ETHEREUM_PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY || 'your_ethereum_private_key';
const VIEW_THRESHOLD = process.env.VIEW_THRESHOLD || 0; // Set the threshold dynamically

// Helper: Fetch YouTube Channel Info Using OAuth Token
const fetchYouTubeChannelInfo = async (accessToken) => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('No channel found');
    }

    const channel = data.items[0];
    return {
      name: channel.snippet.title,
      subscribers: channel.statistics.subscriberCount,
      views: channel.statistics.viewCount,
      videos: channel.statistics.videoCount,
    };
  } catch (error) {
    throw new Error(`Error fetching YouTube channel info: ${error.message}`);
  }
};

// Helper: Run Lit Action Logic
const runLitAction = async (channelInfo, pkpPublicKey) => {
  const viewCount = parseInt(channelInfo.views, 10);
  console.log(`YouTube Channel View Count: ${viewCount}`);

  if (viewCount < VIEW_THRESHOLD) {
    console.log(`View count is below the threshold of ${VIEW_THRESHOLD}.`);
    return { success: false, message: 'View count below threshold' };
  }

  console.log('View count is above the threshold. Proceeding with signing...');

  // Initialize ethers and Lit Node Client
  const ethersSigner = new ethers.Wallet(
    ETHEREUM_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE) // Adjust RPC as needed
  );

  const litNodeClient = new LitNodeClient({
    litNetwork: 'datil-dev', // Use the correct Lit network
    debug: false,
  });

  await litNodeClient.connect();
  console.log('Connected to Lit network');

  const sessionSigs = await litNodeClient.getSessionSigs({
    chain: 'ethereum',
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: { type: 'pkp', id: '*' },
        ability: 'PKP Signing',
      },
      {
        resource: { type: 'lit-action', id: '*' },
        ability: 'Lit Action Execution',
      },
    ],
    authNeededCallback: async () => {
      // Generate a dummy signature
      const toSign = '0xHelloWorld'; // Example message
      return await ethersSigner.signMessage(toSign);
    },
  });

  console.log('Session Signatures obtained:', sessionSigs);

  // Perform the Lit Action signing
  const message = ethers.utils.hashMessage('Hello World');
  const litActionSignatures = await litNodeClient.executeJs({
    sessionSigs,
    code: `
      const sigShare = await LitActions.signEcdsa({
        toSign: '${message}',
        publicKey: '${pkpPublicKey}',
        sigName: 'sig'
      });
    `,
    jsParams: {
      toSign: message,
      publicKey: pkpPublicKey,
      sigName: 'sig',
    },
  });

  console.log('Executed Lit Action');
  return litActionSignatures;
};

// POST /verify endpoint
app.post('/verify', async (req, res) => {
  const { accessToken, pkpPublicKey } = req.body;

  // Validate request body
  if (!accessToken || !pkpPublicKey) {
    console.error('Missing accessToken or pkpPublicKey');
    return res.status(400).json({ error: 'accessToken and pkpPublicKey are required' });
  }

  try {
    // Fetch YouTube channel info using OAuth token
    const channelInfo = await fetchYouTubeChannelInfo(accessToken);
    console.log('Fetched YouTube Channel Info:', channelInfo);

    // Run the Lit Action logic based on channel view count
    const result = await runLitAction(channelInfo, pkpPublicKey);
    res.json(result);
  } catch (error) {
    console.error('Error executing Lit Action:', error);
    res.status(500).json({ error: `Failed to execute Lit Action: ${error.message}` });
  }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
