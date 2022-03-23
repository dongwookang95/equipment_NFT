// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Mock is ERC1155, Ownable {
	constructor() ERC1155("") {
        /// mint Armor
		mint(msg.sender, 0, 1, "");
        /// mint Sword
        mint(msg.sender, 1, 1, "");
        /// mint Sheild
        mint(msg.sender, 2, 1, "");

	}

	function mint(
		address to,
		uint256 id,
		uint256 amount,
		bytes memory data
	) public onlyOwner {
		_mint(to, id, amount, data);
	}
}