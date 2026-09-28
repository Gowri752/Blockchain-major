// Hardhat deployment script
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get the contract factory
  const ImageVerification = await hre.ethers.getContractFactory("ImageVerification");
  
  console.log("📝 Deploying ImageVerification contract...");
  
  // Deploy the contract
  const imageVerification = await ImageVerification.deploy();
  await imageVerification.waitForDeployment();

  const contractAddress = await imageVerification.getAddress();
  console.log("✅ ImageVerification deployed to:", contractAddress);
  console.log("📍 Network:", hre.network.name);
  
  const deploymentTx = imageVerification.deploymentTransaction();
  if (deploymentTx) {
    const receipt = await deploymentTx.wait();
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
  }

  // Save contract address and ABI
  const contractsDir = path.join(__dirname, "../../backend/contracts/compiled");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save address
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ 
      ImageVerification: contractAddress,
      network: hre.network.name,
      deployedAt: new Date().toISOString()
    }, null, 2)
  );

  // Save ABI
  const artifact = await hre.artifacts.readArtifact("ImageVerification");
  fs.writeFileSync(
    path.join(contractsDir, "ImageVerification.abi"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("\n✅ Contract address and ABI saved to backend/contracts/compiled/");
  console.log("\n🔧 Don't forget to update your .env file with:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);

  // Verify on Etherscan (if not local network)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat" && hre.network.name !== "ganache") {
    console.log("\n⏳ Waiting for block confirmations...");
    const deploymentTxForVerify = imageVerification.deploymentTransaction();
    if (deploymentTxForVerify) {
      await deploymentTxForVerify.wait(6);
    }
    
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
