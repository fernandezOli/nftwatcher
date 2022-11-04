// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Nftwatcher is ERC721 {

	address private _owner;
	uint256 private _tokenIdCounter = 0;
	uint256 public _price = 10**14; // 0.0001 token (100000 Gwei - 100000000000000 wei)

    modifier onlyOwner() {
        require(_owner == msg.sender, "Only owner");
        _;
    }

	constructor() ERC721("Nftwatcher", "NFTW") {
		_owner = msg.sender;
	}

	/// @notice mint a new copy and assign it to the user
	function buy() public payable {
		require(msg.value == _price, "You need to pay 0.0001 token to buy the NFT");
		_tokenIdCounter++;
		_safeMint(msg.sender, _tokenIdCounter);
	}

	function totalSupply() public view returns (uint256) {
		return _tokenIdCounter;
	}

	function withdraw() public payable onlyOwner {
		payable(msg.sender).transfer(address(this).balance);
	}
}
