// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import { Script } from "forge-std/Script.sol";
import { EdenLivemint } from "../src/EdenLivemint.sol";

contract Deploy is Script {
    address internal deployer;
    address internal _edenLivemintAddress = vm.envAddress("EDEN_LIVEMINT_ADDRESS");
    EdenLivemint internal _edenLivemint;

    constructor() {
        setUp();
    }

    function setUp() public virtual {
        string memory mnemonic = vm.envString("MNEMONIC");
        (deployer, ) = deriveRememberKey(mnemonic, 0);
        _edenLivemint = EdenLivemint(_edenLivemintAddress);
    }

    function run() public {
        vm.startBroadcast(deployer);
        _edenLivemint.mint();
        vm.stopBroadcast();
    }
}