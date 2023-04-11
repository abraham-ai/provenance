const axios = require("axios");

const gqlEndpoint = "http://localhost:8000/subgraphs/name/eden-subgraph-local";

const interval = 2000;

const args = process.argv.slice(2);
let startBlock = args.length > 0 ? BigInt(args[0]) : 0;

// Function to create query to fetch all MintEvents with their block number greater than startBlock
function buildQuery() {
  return `
    query {
      mintEvents (where: { _change_block: { number_gte: ${startBlock} } }) {
        id
        timestamp
        txHash
        caller
        tokenId
      }
    }
  `;
}

// Function to query the subgraph and log new MintEvents
async function fetchAndLogMintEvents() {
  try {
    const query = buildQuery();
    const response = await axios.post(gqlEndpoint, { query });
    console.log(response.data);

    const newMintEvents = response.data.data.mintEvents;

    if (newMintEvents.length > 0) {
      console.log("New MintEvent(s) found:");
      newMintEvents.forEach((mintEvent) => {
        console.log(`- MintEvent with ID: ${mintEvent.id}`);
        console.log(`  tokenId: ${mintEvent.tokenId}`);
        console.log(`  timestamp: ${mintEvent.timestamp}`);
        console.log(`  txHash: ${mintEvent.txHash}`);
        console.log(`  caller: ${mintEvent.caller}`);
      });

      // Update startBlock
      const mostRecentMintEvent = newMintEvents[newMintEvents.length - 1];
      startBlock = Number(mostRecentMintEvent.timestamp) + 1;
      console.log("Updated startBlock:", startBlock);
    } else {
      console.log("No new MintEvent found.");
    }
  } catch (error) {
    console.error("Error fetching MintEvent data:", error);
  }
}

// Call the function periodically
fetchAndLogMintEvents();
setInterval(fetchAndLogMintEvents, interval);
