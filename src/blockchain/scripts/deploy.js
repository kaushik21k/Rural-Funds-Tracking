async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Deploying PrescriptionRecords contract...");
    console.log("Deployer address:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    // Get the contract factory
    const PrescriptionRecords = await ethers.getContractFactory("PrescriptionRecords");
    
    // Deploy the contract
    console.log("📝 Deploying contract...");
    const contract = await PrescriptionRecords.deploy();
    
    // Wait for deployment
    await contract.deployed();
  
    console.log("✅ PrescriptionRecords deployed successfully!");
    console.log("📍 Contract address:", contract.address);
    console.log("🔗 Network:", await deployer.provider.getNetwork());
    console.log("⛽ Deployment gas used:", (await contract.deployTransaction.wait()).gasUsed.toString());
    
    console.log("\n📋 Next steps:");
    console.log("1. Add this to your .env file:");
    console.log(`   NEXT_PUBLIC_PRESCRIPTION_CONTRACT_ADDRESS=${contract.address}`);
    console.log("2. Verify on BSC Testnet Explorer:");
    console.log(`   https://testnet.bscscan.com/address/${contract.address}`);
  }
  
  main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  });
  