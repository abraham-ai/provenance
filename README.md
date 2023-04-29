# Local Setup

## Install Rust, [Foundry](https://book.getfoundry.sh/getting-started/installation), Forge

```
cd contracts
foundryup
pnpm i
forge install
forge test
```

## Setup graph node

From root of provenance:

```
git clone https://github.com/abraham-ai/graph-node.git
cd graph-node/docker
export MNEMONIC="test test test test test test test test test test test junk"
docker compose up
```

There should now be a local `anvil` blockchain running on localhost:8547, and a local graph node.

## Generate Merkle Root

To generate the merkle root for the allowlist, make a file called `allowlist.txt` somewhere, add the addresses you want to allowlist in it, separated by newlines, then run:

```
pnpm merkleroot /path/to/allowlist.txt
```

Copy the output hash shown in the terminal to `/contracts/.env`.

## Deploy Contracts To Local Blockchain

Setup .env

* `SENDER_ADDRESS`: public address of the account deploying the contract
* `METADATA_MODIFIER`: public address of the account authorized to modify the metadata (can be same as `SENDER_ADDRESS`)
* `MERKLE_ROOT`: from previous step, merkle root of allow list.
* `ALLOW_LIST_ACTIVE`: boolean whether to require merkle root for allowlist.
* `BASE_URI`: a placeholder token URI for all new tokens that don't have successful eden jobs yet.
* `EDEN_LIVEMINT_ADDRESS`: address of the deployed contract (after its been deployed), mainly for testing the watcher/modifier. On Anvil, it's always the same.

To deploy the contract, run:

```
cd contracts
pnpm deploy-local
```

## Deploy Local Subgraph

Make sure contract address in `/src/networks` matches the deployed address in the previous step. Then run:

```
cd eden-subgraph
yarn
yarn refresh-local && yarn prep 1337 && yarn create-local && yarn deploy-local
```

Subgraph will be available [here](http://localhost:8000/subgraphs/name/eden-subgraph-local/graphql?query=query+%7B%0A++mintEvents+%7B%0A++++id%0A++%7D%0A%7D).

## Start Mongo

This is optional, as you can just use Eden API's own Mongo. If you want a local one for testing run:

```
cd eden-subgraph
docker compose up
```

## Start Watcher and Modifier

The watcher script queries the subgraph every so often to look for new mint events, writes them to db, and triggers an Eden job to generate content for the token.

The modify script queries the db for unacknowledged mint events, and updates their token URI with a backend signer when the corresponding Eden job is done.

Setup the .env file.

* `SIGNER_PK`: Private key of the signer account. Should be the private key corresponding to `SENDER_ADDRESS` above.
* `PROVIDER_URL`: Chain url
* `GQL_ENDPOINT`: Subgraph url
* `MONGO_URL`: Url of the mongodb capturing live events
* `MONGO_DB_NAME`: Name of the mongodb database
* `MONGO_COLLECTION_NAME`: Name of the mongodb collection
* `EDEN_API_KEY`: Eden API key for watcher
* `EDEN_API_SECRET`: Eden API secret for watcher
* `PINATA_API_KEY`: Pinata API key for pinning to IPFS
* `PINATA_API_SECRET`: Pinata API secret for pinning to IPFS

Then to start watcher, run:

```
cd watcher
pnpm i
node watch.js
```

In another process, start the modifier:

```
cd watcher
node modify.js
```

## Start the frontend

Fill out the appropriate values in the .env file

* `NEXT_PUBLIC_TESTNET_URL`: Chain url
* `NEXT_PUBLIC_TESTNET_WALLET_KEY`: Private key for mock wallet used for frontend

```
cd frontend
yarn
yarn dev
```

Navigate to [http://localhost:3000](http://localhost:3000). There should already be a wallet connected. Click 'Claim Token'. If all goes well, the token should be minted, the mint is written to the subgraph, the watcher writes the mint to the db, and the modifier will update the metadata.

---

# Deploying to Testnet (Goerli)

## Deploy the contracts

First, in `/contract` fill out the environmental variables you want to use for Goerli.

```
cp .env.example .env.goerli
```

Make sure you have followed the steps above in `Generate Merkle Root` to configure your allowlist.

Now run:

```
cd contracts
pnpm deploy-goerli
```

You will be asked to paste the private key of the address you chose as `SENDER_ADDRESS` in the env file. If all goes well, the contracts will be deployed and verified. Take note of the contract address and block for use in the next step.

## Deploy the Subgraph

If it is your first time deploying the subgraph, navigate to:

https://thegraph.com/studio/

Connect your wallet and create a subgraph named `eden-livemint-dev.

Now, run the following:

```
npm install -g @graphprotocol/graph-cli
graph auth --studio [YOUR DEPLOY KEY HERE]
```

Now you are authenticated to deploy your subgraph to testnet.

Go back to `eden-subgraph/src/networks/5.json` and make sure the contract address and block match the contract deployed in the previous step.

```
cd eden-subgraph
yarn refresh-local && yarn prep 5 && yarn deploy-goerli
```

## Publish the contracts package to NPM

```
cd contracts
npm publish
```

Then update the dependencies to use the new package name anywhere that depends on it.
