const MerkleTree = require("merkletreejs").MerkleTree;
const utils = require("ethers");
const fs = require("fs");

const allowlist = fs.readFileSync("allowlist.txt", "utf-8").split("\n");

const tree = new MerkleTree(allowlist.map(utils.keccak256), utils.keccak256, {
  sortPairs: true,
});

console.log(tree.getRoot().toString("hex"));
