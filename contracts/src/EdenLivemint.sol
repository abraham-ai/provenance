// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { IEdenLivemint } from "./IEdenLivemint.sol";
import { Merkle } from "murky/Merkle.sol";

contract EdenLivemint is IEdenLivemint, ERC721, ERC721URIStorage, Ownable {
    address public metadataModifierAddress;
    string public baseURI;
    uint256 public currentTokenId;
    mapping(uint256 => bool) public metadataModified;
    bool public allowListActive = true;
    Merkle m = new Merkle();
    bytes32 public merkleRoot;

    constructor(
        string memory _name,
        string memory _symbol,
        address _metadataModifierAddress,
        string memory _myBaseURI,
        bool _allowListActive,
        bytes32 _merkleRoot
    )
        ERC721(_name, _symbol)
    {
        metadataModifierAddress = _metadataModifierAddress;
        baseURI = _myBaseURI;
        allowListActive = _allowListActive;
        merkleRoot = _merkleRoot;
        currentTokenId = 0;
    }

    modifier onlyMetadataModifier() {
        require(msg.sender == metadataModifierAddress, "EdenLivemint: caller is not the metadata modifier");
        _;
    }

    function allowListed(address _wallet, bytes32[] calldata _proof) public view returns (bool) {
        return m.verifyProof(merkleRoot, _proof, keccak256(abi.encodePacked(_wallet)));
    }

    function mint(bytes32[] calldata _proof) public {
        if (allowListActive) {
            require(allowListed(msg.sender, _proof), "EdenLivemint: caller is not allowlisted");
        }
        _safeMint(msg.sender, currentTokenId);
        emit Mint(msg.sender, currentTokenId);
        currentTokenId++;
    }

    function setMetadataModifierAddress(address _metadataModifierAddress) public onlyOwner {
        metadataModifierAddress = _metadataModifierAddress;
    }

    function setTokenURI(uint256 _tokenId, string memory _tokenURI) public onlyMetadataModifier {
        require(_exists(_tokenId), "EdenLivemint: token does not exist");
        require(!metadataModified[_tokenId], "EdenLivemint: metadata already modified");
        _setTokenURI(_tokenId, _tokenURI);
        metadataModified[_tokenId] = true;
        emit MetadataUpdate(_tokenId);
    }

    function tokenURI(uint256 _tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        if (metadataModified[_tokenId]) {
            return super.tokenURI(_tokenId);
        } else {
            return baseURI;
        }
    }

    function _burn(uint256 _tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(_tokenId);
    }
}
