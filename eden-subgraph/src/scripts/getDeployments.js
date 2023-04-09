const fs = require("fs");

function getDeployments() {
  // TODO - handle other networks
  const broadcast = "../contracts/broadcast/Deploy.s.sol/1337/run-latest.json";
  const broadcastInfo = fs.readFileSync(broadcast, "utf8");
  const parsed = JSON.parse(broadcastInfo);
  const deployments = parsed.transactions.filter(
    (tx) => tx.transactionType === "CREATE"
  );
  // Make { contractName: contractAddress } object
  let contractAddresses = { network: "mainnet" };
  deployments.map((deployments) => {
    const contractName = deployments.contractName;
    const contractAddress = deployments.contractAddress;
    contractAddresses[`address_${contractName}`] = contractAddress;
  });
  fs.writeFileSync(
    "./src/networks/1337.json",
    JSON.stringify(contractAddresses)
  );
}

getDeployments();
