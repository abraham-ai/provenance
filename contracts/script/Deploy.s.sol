// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import { Script } from "forge-std/Script.sol";
import { EdenLivemint } from "../src/EdenLivemint.sol";

contract Deploy is Script {
    address internal deployer;
    EdenLivemint internal _edenLivemint;

    function setUp() public virtual {
        string memory mnemonic = vm.envString("MNEMONIC");
        (deployer, ) = deriveRememberKey(mnemonic, 0);
    }

    function run() public {
        vm.startBroadcast(deployer);
        _edenLivemint = new EdenLivemint("EdenLivemint", "EDEN", address(0));
        vm.stopBroadcast();
    }
}