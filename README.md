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

To generate the merkle root for the allowlist, make a file called `allowlist.txt` in `/contracts`, add the addresses you want to allowlist, separated by newlines, then run:

```
pnpm merkleroot
```

Copy the output shown in the terminal to `/contracts/.env`.

## Deploy Contracts To Local Blockchain

Setup .env, then run:

```
cd contracts
pnpm deploy-local
```

## Deploy Local Subgraph

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

## Start Watcher scripts

Setup the .env file.

```
cd watcher
pnpm i
node watch.js
node modify.js
```

The watcher script queries the subgraph every so often to look for new mint events and writes them to db.

The modify script queries the db for unacknowledged mint events, and updates their token URI with a backend signer.

## Start the Frontend

Fill out the appropriate values in the .env file

```
cd frontend
yarn
yarn dev
```

Navigate to [http://localhost:3000](http://localhost:3000). There should already be a wallet connected. Click 'Claim Token'. If all goes well, the token should be minted, the mint is written to the subgraph, the watcher writes the mint to the db, and the modifier will update the metadata.

----

# Deploying to Testnet (Goerli)

## Deploy the contracts

First, fill out the environmental variables you want to use for Goerli.

```
cp .env.example .env.goerli
```

Make sure you have followed the steps above in `Generate Merkle Root` to configure your allowlist.

Now run:

```
cd contracts
pnpm deploy-goerli
```

You will be asked to paste the private key of the address you chose as `SENDER_ADDRESS` in the env file. If all goes well, the contracts will be deployed and verified.

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
