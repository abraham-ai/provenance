// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IEdenLivemint {
    event Mint(address indexed _to, uint256 indexed _tokenId);
    event MetadataUpdate(uint256 indexed _tokenId);

    function mint() external;
    function setMetadataModifierAddress(address _metadataModifierAddress) external;
    function setMetadata(uint256 _tokenId) external;
}