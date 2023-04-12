// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import { Script } from "forge-std/Script.sol";
import { EdenLivemint } from "../src/EdenLivemint.sol";

contract Deploy is Script {
    address internal deployer;
    address internal metadataModifier = vm.envAddress("METADATA_MODIFIER");
    string internal _baseURI = "https://gateway.pinata.cloud/ipfs/Qmde91C6FZNdumShjuhH9G2UeJkfoYqEuNgesW8EErUsgZ/";
    EdenLivemint internal _edenLivemint;

    function setUp() public virtual {
        string memory mnemonic = vm.envString("MNEMONIC");
        (deployer, ) = deriveRememberKey(mnemonic, 0);
    }

    function run() public {
        vm.startBroadcast(deployer);
        _edenLivemint = new EdenLivemint("EdenLivemint", "EDEN", metadataModifier, _baseURI);
        vm.stopBroadcast();
    }
}