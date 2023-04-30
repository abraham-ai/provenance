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
        block
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

      const mintEvents = response.data.data.mintEvents;

      if (mintEvents.length > 0) {
        console.log("New MintEvent(s) found:");
        mintEvents.forEach(async (mintEvent) => {

          delete mintEvent.id;
          console.log(`- MintEvent with token ID: ${mintEvent.tokenId}`);
          console.log(`  block: ${mintEvent.block}`);
          console.log(`  txHash: ${mintEvent.txHash}`);
          console.log(`  caller: ${mintEvent.caller}`);

          // Check if mintEvent already saved
          const livemintEvent = await collection.findOne(mintEvent);
          if (livemintEvent) {
            console.log(`= mintEvent ${mintEvent.tokenId} already saved`);
            return;
          }

          // Create Eden task
          const edenConfig = {
            text_input: "Abraham comes alive",
          };
          const result = await edenClient.startTask("create", edenConfig);

          if (result.error) {
            console.log("error", result.error);
            mintEvent.edenSuccess = false;
          } 
          else if (result.taskId) {
            mintEvent.taskId = result.taskId;
          }

          mintEvent.ack = false;

          await collection.insertOne(mintEvent);
        });

        // Update startBlock
        const mostRecentMintEvent = mintEvents.reduce((a, b) =>
          Number(a.block) > Number(b.block) ? a : b
        );
        startBlock = Number(mostRecentMintEvent.block) + 1;
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
