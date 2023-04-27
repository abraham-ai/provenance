const fs = require("fs");

const networkMap = {
  31337: "mainnet",
  1337: "mainnet",
  5: "goerli",
  1: "mainnet",
};

function getDeployments() {
  // TODO - handle other networks
  const broadcasts = "../contracts/broadcast/Deploy.s.sol";

  // Get all subfolders in broadcasts
  const broadcastFolders = fs.readdirSync(broadcasts);
  broadcastFolders.map((chainId) => {
    const broadcast = `${broadcasts}/${chainId}/run-latest.json`;
    const broadcastInfo = fs.readFileSync(broadcast, "utf8");
    const parsed = JSON.parse(broadcastInfo);
    const deployments = parsed.transactions.filter(
      (tx) => tx.transactionType === "CREATE"
    );
    // Make { contractName: contractAddress } object
    let contractAddresses = { network: networkMap[chainId] };
    deployments.map((deployments, idx) => {
      const contractName = deployments.contractName;
      const contractAddress = deployments.contractAddress;
      contractAddresses[`address_${contractName}`] = contractAddress;
      const receipt = parsed.receipts[idx];
      contractAddresses[`startBlock_${contractName}`] = parseInt(
        receipt.blockNumber,
        16
      ).toString();
    });
    fs.writeFileSync(
      `./src/networks/${chainId}.json`,
      JSON.stringify(contractAddresses)
    );
  });
}

getDeployments();
