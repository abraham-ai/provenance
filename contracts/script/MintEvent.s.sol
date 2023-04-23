// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import { Script } from "forge-std/Script.sol";
import { EdenLivemint } from "../src/EdenLivemint.sol";
import { Merkle } from "murky/Merkle.sol";

contract MintEvent is Script {
    address internal deployer;
    address internal _edenLivemintAddress = vm.envAddress("EDEN_LIVEMINT_ADDRESS");
    EdenLivemint internal _edenLivemint;
    Merkle m = new Merkle();

    constructor() {
        setUp();
    }

    function setUp() public virtual {
        string memory mnemonic = vm.envString("MNEMONIC");
        (deployer, ) = deriveRememberKey(mnemonic, 0);
        _edenLivemint = EdenLivemint(_edenLivemintAddress);
    }

    function run() public {
        bytes32[] memory allowlist = new bytes32[](1);
        allowlist[0] = keccak256(abi.encodePacked(deployer));
        bytes32[] memory proof = m.getProof(allowlist, 0);
        vm.startBroadcast(deployer);
        _edenLivemint.mint(proof);
        vm.stopBroadcast();
    }
}