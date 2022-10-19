// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Nftwatcher is ERC721 {

	address private _owner;
	uint256 private _tokenIdCounter = 0;
	uint256 private _price = 10**17; // 0.1 token

    modifier onlyOwner() {
        require(_owner == msg.sender, "Only owner");
        _;
    }

	constructor() ERC721("Nftwatcher", "NFTW") {
		_owner = msg.sender;
	}

	/// @notice mint a new copy and assign it to the user
	function buy() public payable {
		require(msg.value == _price, string(abi.encodePacked("You need to pay 0.1 token to buy the NFT")));
		_tokenIdCounter++;
		_safeMint(msg.sender, _tokenIdCounter);
	}

	function withdraw() public payable onlyOwner {
		payable(msg.sender).transfer(address(this).balance);
	}
}
