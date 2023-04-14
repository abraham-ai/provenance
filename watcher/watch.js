const axios = require("axios");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const gqlEndpoint = process.env.GQL_ENDPOINT;
const interval = 2000;
const uri = process.env.MONGO_URL;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION_NAME;
const edenApiKey = process.env.EDEN_API_KEY;
const edenApiSecret = process.env.EDEN_API_SECRET;

const args = process.argv.slice(2);
let startBlock = args.length > 0 ? BigInt(args[0]) : 0;

// Function to create query to fetch all MintEvents with their block number greater than startBlock
const buildQuery = () => {
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
};

// Function to query the subgraph and log new MintEvents
const main = async () => {
  const edenSdk = await import("eden-sdk");
  const { EdenClient } = edenSdk;

  const clientMongo = new MongoClient(uri);
  await clientMongo.connect();

  const db = clientMongo.db(dbName);
  const collection = db.collection(collectionName);

  const edenClient = new EdenClient(edenApiKey, edenApiSecret);

  const fetchAndLogMintEvents = async () => {
    try {
      const query = buildQuery();
      const response = await axios.post(gqlEndpoint, { query });
      console.log(response.data);

      const newMintEvents = response.data.data.mintEvents;

      if (newMintEvents.length > 0) {
        console.log("New MintEvent(s) found:");
        newMintEvents.forEach(async (mintEvent) => {
          console.log(`- MintEvent with ID: ${mintEvent.id}`);
          console.log(`  tokenId: ${mintEvent.tokenId}`);
          console.log(`  timestamp: ${mintEvent.timestamp}`);
          console.log(`  txHash: ${mintEvent.txHash}`);
          console.log(`  caller: ${mintEvent.caller}`);
          mintEvent.ack = false;

          const edenConfig = {
            text_input: "Cyberpunk NFT",
          };
          const taskId = await edenClient.startTask("create", edenConfig);
          console.log("eden task id: ", taskId);
          mintEvent.taskId = taskId;
        });

        // Insert new MintEvents into MongoDB
        console.log(
          `Inserting ${newMintEvents.length} new MintEvent(s) into MongoDB...`
        );

        await collection.insertMany(newMintEvents);

        // Update startBlock
        const mostRecentMintEvent = newMintEvents.reduce((a, b) =>
          Number(a.timestamp) > Number(b.timestamp) ? a : b
        );
        startBlock = Number(mostRecentMintEvent.timestamp) + 1;
        console.log("Updated startBlock:", startBlock);
      } else {
        console.log("No new MintEvent found.");
      }
    } catch (error) {
      console.error("Error fetching MintEvent data:", error);
    }
  };

  fetchAndLogMintEvents();
  setInterval(fetchAndLogMintEvents, interval);
};

main();
