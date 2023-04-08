// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IEdenLivemint } from "./IEdenLivemint.sol";

contract EdenLivemint is IEdenLivemint, ERC721, ERC721URIStorage, Ownable {
    address public metadataModifierAddress;
    uint256 public currentTokenId;

    constructor(string memory _name, string memory _symbol, address _metadataModifierAddress) ERC721(_name, _symbol) {
        metadataModifierAddress = _metadataModifierAddress;
        currentTokenId = 0;
    }

    modifier onlyMetadataModifier() {
        require(msg.sender == metadataModifierAddress, "EdenLivemint: caller is not the metadata modifier");
        _;
    }

    function mint() public {
        _safeMint(msg.sender, currentTokenId);
        currentTokenId++;
        emit Mint(msg.sender, currentTokenId);
    }

    function setMetadataModifierAddress(address _metadataModifierAddress) public onlyOwner {
        metadataModifierAddress = _metadataModifierAddress;
    }

    function setTokenURI(uint256 _tokenId, string memory _tokenURI) public onlyMetadataModifier {
        _setTokenURI(_tokenId, _tokenURI);
    }

    function _burn(uint256 _tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(_tokenId);
    }
}