// Import required modules
const express = require('express');
const { ethers } = require('ethers');

// Define configuration
const PORT = 3000;
const PROVIDER_URL = 'YOUR_PROVIDER_URL'; // e.g., Infura URL or Alchemy URL
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY'; // Private key of the sender account
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS'; // Address of the deployed contract
const CONTRACT_ABI = [
  'function studentSaltTable(uint256) public view returns (uint256)',
  'function setSalt(uint256[] memory studentNumberList, uint256[] memory saltHash) external'
];

// Initialize Express app
const app = express();

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Parse ABI and create contract instance
const abi = ethers.parseAbi(CONTRACT_ABI);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// Define route to handle GET requests
app.get('/callContract', async (req, res) => {
  try {
    // Call the contract function (example: calling setSalt function)
    const studentNumberList = [1, 2, 3];
    const saltHash = [100, 200, 300];
    const txResponse = await contract.setSalt(studentNumberList, saltHash);

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait();

    // Send response
    res.json({
      message: 'Contract function called successfully!',
      txHash: receipt.transactionHash,
      receipt: receipt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to call contract function' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
