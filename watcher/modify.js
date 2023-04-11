const { MongoClient } = require("mongodb");
const ethers = require("ethers");
require("dotenv").config();
const fs = require("fs");

const uri = "mongodb://eden:eden@localhost:27017/eden";
const dbName = "eden";
const collectionName = "livemints";
const interval = 5000; // 5 seconds

const LivemintAbi = require("../contracts/out/EdenLivemint.sol/EdenLivemint.json");

const getLiveMintAddress = () => {
  const broadcast = "../contracts/broadcast/Deploy.s.sol/1337/run-latest.json";
  const broadcastInfo = fs.readFileSync(broadcast, "utf8");
  const parsed = JSON.parse(broadcastInfo);
  const deployments = parsed.transactions.filter(
    (tx) => tx.transactionType === "CREATE"
  );
  return deployments[0].contractAddress;
};

const getSigner = (provider) => {
  SIGNER_PK = process.env.SIGNER_PK;
  const signer = new ethers.Wallet(SIGNER_PK, provider);
  return signer;
};

const getContract = (provider) => {
  const livemintAddress = getLiveMintAddress();
  const signer = getSigner(provider);
  const Livemint = new ethers.Contract(
    livemintAddress,
    LivemintAbi.abi,
    signer
  );

  return Livemint;
};

const modifyMetadata = async (livemint, tokenId) => {
  const newTokenURI = "https://ipfs.io/ip";
  const tx = await livemint.setTokenURI(tokenId, newTokenURI, {
    gasLimit: 10000000,
  });
  const receipt = await tx.wait();
  console.log("receipt", receipt);
};

// Function to query the collection for mint events with ack = false
const main = async () => {
  const PROVIDER_URL = process.env.PROVIDER_URL;
  const provider = ethers.getDefaultProvider(PROVIDER_URL);
  const Livemint = getContract(provider);

  const clientMongo = new MongoClient(uri);
  await clientMongo.connect();

  const db = clientMongo.db(dbName);
  const collection = db.collection(collectionName);

  async function fetchUnacknowledgedMintEvents() {
    try {
      const query = { ack: false };
      const result = await collection.find(query).toArray();

      if (result.length === 0) {
        console.log("No unacknowledged MintEvent found.");
        return;
      }

      console.log(`Found ${result.length} unacknowledged MintEvent(s)`);

      result.forEach(async (mintEvent) => {
        // Modify metadata
        console.log("Modifying metadata for MintEvent with ID:", mintEvent.id);
        const tokenId = mintEvent.tokenId;
        await modifyMetadata(Livemint, tokenId);

        // Update ack to true
        console.log(
          "Updating ack to true for MintEvent with ID:",
          mintEvent.id
        );
        const filter = { id: mintEvent.id };
        const update = { $set: { ack: true } };
        const options = { upsert: true };
        collection.updateMany(filter, update, options);
      });

      return result;
    } catch (error) {
      console.error("Error fetching unacknowledged MintEvent data:", error);
      return;
    }
  }

  fetchUnacknowledgedMintEvents();
  setInterval(fetchUnacknowledgedMintEvents, interval);
};

main();
