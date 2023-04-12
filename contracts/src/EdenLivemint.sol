// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { IEdenLivemint } from "./IEdenLivemint.sol";
import { console2 } from "forge-std/console2.sol";

contract EdenLivemint is IEdenLivemint, ERC721, Ownable {
    address public metadataModifierAddress;
    string public baseURI;
    uint256 public currentTokenId;
    mapping(uint256 => bool) public hasMetadata;

    constructor(string memory _name, string memory _symbol, address _metadataModifierAddress, string memory _myBaseURI) ERC721(_name, _symbol) {
        metadataModifierAddress = _metadataModifierAddress;
        baseURI = _myBaseURI;
        currentTokenId = 0;
    }

    modifier onlyMetadataModifier() {
        require(msg.sender == metadataModifierAddress, "EdenLivemint: caller is not the metadata modifier");
        _;
    }

    function mint() public {
        _safeMint(msg.sender, currentTokenId);
        emit Mint(msg.sender, currentTokenId);
        currentTokenId++;
    }

    function setMetadataModifierAddress(address _metadataModifierAddress) public onlyOwner {
        metadataModifierAddress = _metadataModifierAddress;
    }

    function setMetadata(uint256 _tokenId) public onlyMetadataModifier {
        hasMetadata[_tokenId] = true;
        emit MetadataUpdate(_tokenId);
    }

    function tokenURI(uint256 _tokenId) public view override(ERC721) returns (string memory) {
        if (hasMetadata[_tokenId]) {
            return string(abi.encodePacked(baseURI, Strings.toString(_tokenId), '.json'));
        } else {
            return string(abi.encodePacked(baseURI, 'base.json'));
        }
    }
}