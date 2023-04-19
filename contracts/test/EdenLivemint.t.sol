// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import { PRBTest } from "@prb/test/PRBTest.sol";
import { console2 } from "forge-std/console2.sol";
import { StdCheats } from "forge-std/StdCheats.sol";
import { EdenLivemint } from "../src/EdenLivemint.sol";

contract EdenLivemintTest is PRBTest, StdCheats {
    EdenLivemint internal _edenLivemint;
    address internal _owner = address(bytes20(keccak256("ownerd")));
    address internal _metadataModifierAddress = address(bytes20(keccak256("metadataModifierAddress")));
    address internal _minter = address(bytes20(keccak256("minter")));
    string internal _baseURI = "https://gateway.pinata.cloud/ipfs/QmQfGTzvFexjWYmyEWx6phoquTkgWm3ka1Pv7gcghhToUc";
    string internal _modifiedURI = "https://gateway.pinata.cloud/ipfs/QmQfGTzvFexjWYmyEWx6phoquTkgWm3ka1Pv7gcghhToUd";


    function setUp() public virtual {
        vm.label(_owner, "owner");
        vm.label(_metadataModifierAddress, "metadataModifierAddress");
        vm.label(_minter, "minter");

        vm.deal(_owner, 100 ether);
        vm.deal(_metadataModifierAddress, 100 ether);
        vm.deal(_minter, 100 ether);
        
        vm.prank(_owner);
        _edenLivemint = new EdenLivemint("EdenLivemint", "EDEN", _metadataModifierAddress, _baseURI);
    }

    function testMint() public {
        assertEq(_edenLivemint.balanceOf(_minter), 0);
        vm.prank(_minter);
        _edenLivemint.mint();
        assertEq(_edenLivemint.balanceOf(_minter), 1);
        assertEq(_edenLivemint.ownerOf(0), _minter);
        assertEq(_edenLivemint.tokenURI(0), _baseURI);
    }

    function testSetMetadataModifierAddress() public {
        assertEq(_edenLivemint.metadataModifierAddress(), _metadataModifierAddress);
        vm.prank(_owner);
        _edenLivemint.setMetadataModifierAddress(_owner);
        assertEq(_edenLivemint.metadataModifierAddress(), _owner);
    }

    function testRandomCannotSetMetadataModifierAddress() public {
        vm.prank(_minter);
        vm.expectRevert(
            "Ownable: caller is not the owner"
        );
        _edenLivemint.setMetadataModifierAddress(_owner);
    }

    function testSetTokenURI() public {
        vm.prank(_minter);
        _edenLivemint.mint();

        vm.prank(_metadataModifierAddress);
        _edenLivemint.setTokenURI(0, _modifiedURI);
        assertEq(_edenLivemint.tokenURI(0), _modifiedURI);
    }

    function testRandomCannotSetTokenURI() public {
        vm.prank(_minter);
        _edenLivemint.mint();

        vm.prank(_minter);
        vm.expectRevert(
            "EdenLivemint: caller is not the metadata modifier"
        );
        _edenLivemint.setTokenURI(0, _modifiedURI);
    }

    function testTokenURICannotBeModifiedTwice() public {
        vm.prank(_minter);
        _edenLivemint.mint();

        vm.prank(_metadataModifierAddress);
        _edenLivemint.setTokenURI(0, _modifiedURI);
        assertEq(_edenLivemint.tokenURI(0), _modifiedURI);

        vm.prank(_metadataModifierAddress);
        vm.expectRevert(
            "EdenLivemint: metadata already modified"
        );
        _edenLivemint.setTokenURI(0, _modifiedURI);
    }

    function testCannotSetTokenURIOnNonExistentToken() public {
        vm.prank(_minter);
        _edenLivemint.mint();

        vm.prank(_metadataModifierAddress);
        vm.expectRevert(
            "EdenLivemint: token does not exist"
        );
        _edenLivemint.setTokenURI(100, _modifiedURI);
    }
}
