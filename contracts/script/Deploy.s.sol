// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import { Script } from "forge-std/Script.sol";
import { EdenLivemint } from "../src/EdenLivemint.sol";

contract Deploy is Script {
    address internal metadataModifier = vm.envAddress("METADATA_MODIFIER");
    string internal _baseURI = vm.envString("BASE_URI");
    bytes32 internal _merkleRoot = vm.envBytes32("MERKLE_ROOT");
    EdenLivemint internal _edenLivemint;

    function run() public {
        vm.startBroadcast();
        _edenLivemint = new EdenLivemint("EdenLivemint", "EDEN", metadataModifier, _baseURI, _merkleRoot);
        vm.stopBroadcast();
    }
}
