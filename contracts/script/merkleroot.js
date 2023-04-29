const MerkleTree = require("merkletreejs").MerkleTree;
const utils = require("ethers");
const fs = require("fs");
const path = require("path");

// Get the path to the allowlist file from the command line arguments
const args = process.argv.slice(2);
const allowlistFilePath = args[0];
if (!allowlistFilePath) {
  console.error("Error: Please specify the path to the allowlist file.");
  process.exit(1);
}

// Check if the allowlist file exists
if (!fs.existsSync(allowlistFilePath)) {
  console.error(`Error: File not found: ${allowlistFilePath}`);
  process.exit(1);
}

const allowlist = fs.readFileSync(allowlistFilePath, "utf-8").split("\n");

const tree = new MerkleTree(allowlist.map(utils.keccak256), utils.keccak256, {
  sortPairs: true,
});

console.log(tree.getRoot().toString("hex"));
