// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IEdenLivemint {
    event Mint(address indexed _to, uint256 indexed _tokenId);
    event MetadataUpdate(uint256 indexed _tokenId);

    function mint(bytes32[] memory _proof) external;
    function setMetadataModifierAddress(address _metadataModifierAddress) external;
    function setTokenURI(uint256 _tokenId, string memory _metadata) external;
}