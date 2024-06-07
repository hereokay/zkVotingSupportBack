// Import required modules
const express = require('express');
const { ethers } = require('ethers');
const { parseAbi} = require('viem');
const cors = require('cors');


require('dotenv').config(); // Load environment variables from .env file


const {
    fetchUserList,
    putUserSalt,
    putUserAddress,
    getUserByCode
} = require("./utils/backend.js");


function calcStudentSaltHash(studentId, salt){

    const strId = studentId.toString();

    const sumString = strId + salt;
    return ethers.keccak256(ethers.toUtf8Bytes(sumString));
}

// Define configuration 
const PORT = 4000;
const PROVIDER_URL = process.env.PROVIDER_URL; // e.g., Infura URL or Alchemy URL
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Private key of the sender account
const CONTRACT_ADDRESS = process.env.VOTINGBOX_CONTRACT_ADDRESS; // votingBox
const CONTRACT_ABI = [
  'function studentSaltTable(uint256) public view returns (uint256)',
  'function setSalt(uint256[] memory studentNumberList, uint256[] memory saltHash) external',
  'function registVoter(address voterAddress, uint hashValue) external'
];

// Initialize Express app
const app = express();
app.use(cors());
// http://localhost:4000/allocateAddress?code=12345

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Parse ABI and create contract instance
const abi = parseAbi(CONTRACT_ABI);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// Define route to handle GET requests
app.get('/allocateAddress', async (req, res) => {
  try {
    // Call the contract function (example: calling setSalt function)
    
    const code = req.query.code;


    const user = await getUserByCode(code);

    // H(StudentId + Salt)
    const oneHash = calcStudentSaltHash(user['Code'],user['Salt']);
    const txResponse = await contract.registVoter(user['Address'], oneHash);

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


