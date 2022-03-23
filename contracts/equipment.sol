// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";




interface IERC20Upgradeable {
    function totalSupply() external view returns (uint256);
    function transfer(address recipient, uint amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint value);
}

contract Equipment is ERC1155Upgradeable, OwnableUpgradeable {
    
    
    /// assigning a id to each NFTs
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;

	string public _baseURI = "https://raw.githubusercontent.com/dongwookang95/equipment_NFT/master/other/turi.json/";
	string public _contractURI ="https://raw.githubusercontent.com/dongwookang95/equipment_NFT/master/other/curi.json";

    /// in order to set the price of a equipment.
    uint256 public itemPrice; 

    
    function initialize() public initializer {
        itemPrice=0.1 ether;
    }


    enum Category { Armor,Sword,Shield }
    Category public category;
    

    struct Equipments{
        string name;
        uint256 itemId;
        Category category;
    }

    mapping(uint256 => Equipments) private equipmentSupply;
    
    /// minting 
    bool public publicMintEnabled;
    bool public holderMintEnabled;
    uint256 mintPrice = 0.1 ether;
    /// public mintning functions
    function mintEquipment(uint8 _category) public payable checkMintInput(_category){
        require(msg.value <= mintPrice, "You don't have enough ETH");
        require(publicMintEnabled, "public mint is currently disabled");
        if(_category == 0){
            mintArmor();
        }else if(_category == 1){
            mintSword();
        }else if(_category ==2){
            mintShield();
        }
        //If total public sale reach to 1000, disable public mint equipment function
        if(_tokenId.current()>=1000){
            setPublicMintEnabled(false);
            setHolderMintEnabled(true);
        }
    }
    /// holder minting functions after public sale
    function holderMintEquipment(uint _id, uint8 _category) public payable checkMintInput(_category){
        require(holderMintEnabled, "public mint is not done");
        require(msg.value <= mintPrice, "You don't have enough ETH");
        require(balanceOf(msg.sender, _id) > 0, "you are not owning any equipments");
        if(_category == 0){
            mintArmor();
        }else if(_category == 1){
            mintSword();
        }else if(_category == 2){
            mintShield();
        }
    }
    

    function mintArmor() private{
        Equipments memory mintedEquipment = Equipments({
            name : string(concat(bytes("Armor "), bytes(uint2str(_tokenId.current())))),
            itemId : _tokenId.current(),
            category : Category.Armor
        });
        _mint(msg.sender, mintedEquipment.itemId, 1, "0x00");
        setMappingValue(mintedEquipment.itemId, mintedEquipment);
        _tokenId.increment(); 
    }

    function mintSword() private{
        Equipments memory mintedEquipment = Equipments({
            name : string(concat(bytes("Sword "), bytes(uint2str(_tokenId.current())))),
            itemId : _tokenId.current(),
            category : Category.Sword
        });
        _mint(msg.sender, mintedEquipment.itemId, 1, "0x00");
        setMappingValue(mintedEquipment.itemId, mintedEquipment);
        _tokenId.increment(); 
    }

    function mintShield() private{
        Equipments memory mintedEquipment = Equipments({
            name : string(concat(bytes("Shield "), bytes(uint2str(_tokenId.current())))),
            itemId : _tokenId.current(),
            category : Category.Shield
        });
        _mint(msg.sender, mintedEquipment.itemId, 1, "0x00");
        setMappingValue(mintedEquipment.itemId, mintedEquipment);
        _tokenId.increment(); 
    }
    
    function setPublicMintEnabled(bool _val) public onlyOwner {
        publicMintEnabled = _val;
    }

    function setHolderMintEnabled(bool _val) public onlyOwner {
        holderMintEnabled = _val;
    }

    /// burn functions
    function burnShield(uint _tId) external {
        //1. get the tokenId from holder
        //2. check the map if the tokenId has Shield on Category attribute;
        //노드와 interaction을 할 필요가 없다. 그냥 읽어오는거니까. storage를 쓰면 checkvalue라는 메모리를 더 쓰게되니까 여기서는 메모리가 맞다. 
        Equipments memory checkValue =  equipmentSupply[_tId];
        //msg.sender가 verification 필요해
        //msg.sender 해당 토큰 id의 balance를 확인해서 verification 가능
        require(balanceOf(msg.sender, _tId)>0, "You are not owning this token");
        require(checkValue.category == Category.Shield, "Provided tokenId is not shield. You cannot burn");
        //The lose ratio shd't go above 100%
        uint8 loseRatio=2;
        /// onlyowner를 써서 내가 테스트를 할땐 그냥 임의의 숫자로 하되, 오너가 아닐땐 VRF를 쓰게만들어주는 펑션.
        /// below simpleRandom function is for testing purpose
        
        if(randomNumber() < loseRatio) {
            _burn(msg.sender, _tId, 1);
            removeMappingValue(_tId);
        }else{
            if(publicMintEnabled == true){
                mintEquipment(1);
                _burn(msg.sender, _tId, 1);
                removeMappingValue(_tId);
            }else{
                holderMintEquipment(_tId,1);
                _burn(msg.sender,_tId,1);
                removeMappingValue(_tId);
            }
        }
    }    

    //URI relate functions

    function setBaseURI(string memory newuri) public onlyOwner {
        _baseURI = newuri;
	}

	function setContractURI(string memory newuri) public onlyOwner {
		_contractURI = newuri;
	}

	function uri(uint256 tokenId) public view override returns (string memory) {
		return string(abi.encodePacked(_baseURI, uint2str(tokenId)));
	}

	function tokenURI(uint256 tokenId) public view returns (string memory) {
		return string(abi.encodePacked(_baseURI, uint2str(tokenId)));
	}

	function contractURI() public view returns (string memory) {
		return _contractURI;
	}

    //governance functions
    // sets the price for an item
    function setItemPrice(uint256 _price) public onlyOwner {
		itemPrice = _price;
	}

	function getItemPrice() public view returns (uint256) {
		return itemPrice;
	}
    // withdraw the earnings to pay for the artists & devs :)
	function withdraw() public onlyOwner {
		uint256 balance = address(this).balance;
		payable(msg.sender).transfer(balance);
	}

    // simple random number generator function 
    // needs to be replaced by chainlink vrf

    function randomNumber() public view returns(uint){
        uint8 possibleRandomNumber =10;
        return uint(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty, 
            msg.sender)
            ))%possibleRandomNumber;
    }

    //Other utility functions
    /**
	 * @dev Total amount of tokens in with a given id.
	 */
	function getEquipmentSupply(uint256 id) public view virtual returns (Equipments memory) {
		return equipmentSupply[id];
	}

	// /**
	//  * @dev Indicates weither any token exist with a given id, or not.
	//  */
	// function exists(uint256 id) public view virtual returns (bool) {
	// 	return totalSupply(id) > 0;
	// }
    //@ uint _i is tokenid which suppose to be the location(index in the mapping)
    //@ _e is the Equipments struct that will contain the information.
    function setMappingValue(uint _i, Equipments memory _e) private{
        equipmentSupply[_i] = _e;
    }

    function removeMappingValue(uint _i) private{
        delete equipmentSupply[_i];
    }
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
    }

    function concat(bytes memory a, bytes memory b) internal pure returns (bytes memory) {
        return abi.encodePacked(a, b);
    }
    modifier checkMintInput(uint8 _int){
        //There is no occurance to generate negative number.
        require(_int<3, "It is out of category range");
        _;
    }
}
