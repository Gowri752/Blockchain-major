require('dotenv').config({ path: '../.env' });

console.log('Testing .env loading...');
console.log('PRIVATE_KEY exists:', !!process.env.PRIVATE_KEY);
console.log('PRIVATE_KEY length:', process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
console.log('PRIVATE_KEY value:', process.env.PRIVATE_KEY);
console.log('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS);
console.log('ETHEREUM_NODE_URL:', process.env.ETHEREUM_NODE_URL);
