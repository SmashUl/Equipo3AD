require('dotenv').config();
const fs = require('fs')
const FormData = require('form-data');
const axios = require("axios")
const { ethers } = require("ethers")

const contract = require("../artifacts/contracts/NFTContract.sol/ArGram.json");
const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    API_URL,
    PRIVATE_KEY,
    PUBLIC_KEY,
    CONTRACT_ADDRESS
} = process.env;

async function createImgInfo() {
    const authResponse = await axios.get("https://api.pinata.cloud/data/testAuthentication", {
        headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
        },
    });
    console.log(authResponse)
    const stream = fs.createReadStream("./images/RevisandoRigo.jpg")
    const data = new FormData()
    data.append("file", stream)
    const fileResponse = await
        axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data,
            {
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY
                }
            })
    const { data: fileData = {} } = fileResponse;
    const { IpfsHash } = fileData;
    const fileIPFS = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log(fileIPFS)
}
//createImgInfo()

async function createJsonInfo(){
    const metadata={
        image:"https://gateway.pinata.cloud/ipfs/QmePbHJRBhfPxcESt2wfJqYzS7e2fUQTkSKU7YPZxRU8Ws",
        name:"MyFirstNFT",
        description:"Aun no se que sera",
        attribites:[
            {"trait_type":"color","value":"brown"},
            {"trait_type":"background","value":"white"},
        ]
    }
    const pinataJSONBody={
        pinataContent:metadata
    }

const jsonResponse = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    pinataJSONBody,
    {
        headers:{
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key:PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY
        }  
    }
)
const {data:jsonData={}}=jsonResponse;
const {IpfsHash}=jsonData;
const tokenURI=`https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log(tokenURI)
}

async function mintNFT(){
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY,provider);
    const etherInterface = new ethers.utils.Interface(contract.abi);
    const nonce = await provider.getTransactionCount(PUBLIC_KEY,"latest");
    const gasPrice = await provider.getGasPrice();
    const network = await provider.getNetwork();
    const {chainId}=network;
    const transaction={
        from:PUBLIC_KEY,
        to: CONTRACT_ADDRESS,
        nonce,
        chainId,
        gasPrice,
        data:etherInterface.encodeFunctionData("mintNFT",
        [PUBLIC_KEY,"https://gateway.pinata.cloud/ipfs/QmePbHJRBhfPxcESt2wfJqYzS7e2fUQTkSKU7YPZxRU8Ws"])
    }
    const estimateGas = await provider.estimateGas(transaction)
    transaction["gasLimit"]=estimateGas;
    const signedTx= await wallet.signTransaction(transaction)
    const transactionReceipt=await provider.sendTransaction(signedTx);
    await transactionReceipt.wait()
    const hash = transactionReceipt.hash;
    console.log("Your transaction hash is:",hash)

    const receipt = await provider.getTransactionReceipt(hash);
    const {logs}=receipt;
    const tokenInBigNumber=ethers.BigNumber.from(logs[0].topics[3]);
    const tokenId=tokenInBigNumber.toNumber();
    console.log("NFT token Id:",tokenId);
}
mintNFT()