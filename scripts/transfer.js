const { ethers } = require("ethers");
const contract = require("../artifacts/contracts/NFTContract.sol/ArGram.json");
const {
   API_URL,
   PRIVATE_KEY,
   PUBLIC_KEY,
   CONTRACT_ADDRESS,
   USER_ADDRESS
} = process.env;
async function transferNFT(){
const provider = new ethers.providers.JsonRpcProvider(API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const gasPrice = await provider.getGasPrice();
console.log(gasPrice);
const nftContract = new ethers.Contract(
   CONTRACT_ADDRESS,
   contract.abi,
   wallet
);
var tokenId=10;
const gasLimit = await nftContract.estimateGas["safeTransferFrom(address,address,uint256)"](PUBLIC_KEY, USER_ADDRESS, tokenId, { gasPrice });
console.log(gasLimit)
const transaction = await nftContract["safeTransferFrom(address,address,uint256)"](PUBLIC_KEY, USER_ADDRESS, tokenId, { gasLimit });
await transaction.wait();
console.log("Transaction Hash: ", transaction.hash);
}
transferNFT()