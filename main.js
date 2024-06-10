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
const VOTINGBOX_ADDRESS = process.env.VOTINGBOX_ADDRESS; // votingBox
const VOTINGBOX_ABI = [
  'function studentSaltTable(uint256) public view returns (uint256)',
  'function setSalt(uint256[] memory studentNumberList, uint256[] memory saltHash) external',
  'function registVoter(address voterAddress, uint hashValue) external'
];


const TORNADO_ADDRESS = process.env.TORNADO_ADDRESS;
const TORNADO_ABI = [
  
]

// Initialize Express app
const app = express();
app.use(cors());
// http://localhost:4000/allocateAddress?code=12345

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);



// Define route to handle GET requests
app.post('/finalVote', async (req, res) => {
  try {
    // Call the contract function (example: calling setSalt function)
     // Parse ABI and create contract instance
    const abi = parseAbi(TORNADO_ABI);
    const contract = new ethers.Contract(TORNADO_ADDRESS, abi, wallet);

    const { callInputs, tokenAddress, candidateAddress } = req.body;

    // const tx = await tornado.connect(layer).withdraw(...callInputs, token.target, candidate.address);

    const txResponse = await contract.withdraw(...callInputs, tokenAddress, candidateAddress);

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

// Define route to handle GET requests
app.get('/allocateAddress', async (req, res) => {
  try {
    // Call the contract function (example: calling setSalt function)
  
    // Parse ABI and create contract instance
    const abi = parseAbi(VOTINGBOX_ABI);
    const contract = new ethers.Contract(VOTINGBOX_ADDRESS, abi, wallet);


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





