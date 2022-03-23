const { expect, assert } = require("chai")
const chai = require("chai")
const { web3, ethers } = require("hardhat")
const { upgrades } = require('hardhat');
const { solidity } = require("ethereum-waffle")
const { BN, time, balance, expectEvent, expectRevert } = require("@openzeppelin/test-helpers")
const ether = require("@openzeppelin/test-helpers/src/ether")

chai.use(solidity);

describe("EquipmentTest", function() {
    this.beforeEach(async function() {
            const mockERC1155Contract = await ethers.getContractFactory("ERC1155Mock");
            mockERC1155 = await mockERC1155Contract.deploy();
            await mockERC1155.deployed();
            [owner, acc1, acc2, acc3] = await ethers.getSigners()
            nft = await upgrades.deployProxy(await ethers.getContractFactory("Equipment"));
        })
        /// basic test
    it("Simple test...", async function() {
        expect(await nft.owner()).to.equal(owner.address)
    })


    it("Check if setPublicMintEnabled + balanceOf is working", async function() {
        await nft.connect(owner).setPublicMintEnabled(true);

        let balanceOfArmor = Number(await nft.connect(owner).balanceOf(owner.address, 0));
        expect(balanceOfArmor).to.equal(0);

        let balanceOfArmorMock = Number(await mockERC1155.balanceOf(owner.address, 0));
        expect(balanceOfArmorMock).to.equal(1);

        await nft.mintEquipment(0);
        balanceOfArmor = Number(await nft.balanceOf(owner.address, 0));
        expect(balanceOfArmor).to.equal(1);
    })

    // safeTransferFrom(from, to, id, amount, data)
    it("Test for safeTransferFrom function", async function() {
        await nft.setPublicMintEnabled(true);

        //acc1 doesn't have any nft.
        let balanceOf0 = Number(await nft.connect(acc1).balanceOf(acc1.address, 0));
        expect(balanceOf0).to.equal(0);

        //owner mint 1 nft to send
        await nft.connect(owner).mintEquipment(0);
        balanceOf0 = Number(await nft.balanceOf(owner.address, 0));
        expect(balanceOf0).to.equal(1);

        //check acc1 has received!
        await nft.safeTransferFrom(owner.address, acc1.address, 0, 1, 0x00);
        balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));

        expect(balanceOf0).to.equal(1);
    })

    // safeBatchTransferFrom(from, to, ids, amounts, data)
    it("Test for safeBatchTransferFrom function", async function() {
            await nft.setPublicMintEnabled(true);
            let balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
            expect(balanceOf0).to.equal(0);
            //owner account will mint 3 nfts.
            await nft.connect(owner).mintEquipment(0);
            await nft.connect(owner).mintEquipment(1);
            await nft.connect(owner).mintEquipment(2);
            balanceOf0 = Number(await nft.balanceOf(owner.address, 0));
            balanceOf1 = Number(await nft.balanceOf(owner.address, 1));
            balanceOf2 = Number(await nft.balanceOf(owner.address, 2));
            expect(balanceOf0 + balanceOf1 + balanceOf2).to.equal(3);

            let ids = [0, 1, 2];
            let amount = [1, 1, 1]
                //send them to acc1 address.
            await nft.safeBatchTransferFrom(owner.address, acc1.address, ids, amount, "0x00");
            balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
            balanceOf1 = Number(await nft.balanceOf(acc1.address, 1));
            balanceOf2 = Number(await nft.balanceOf(acc1.address, 2));
            // check if acc1 has 3 nfts
            expect(balanceOf0 + balanceOf1 + balanceOf2).to.equal(3);
        })
        // balanceOfBatch(accounts, ids)
    it("Test for balanceOfBatch function", async function() {
        await nft.setPublicMintEnabled(true);
        // Each accout will mint one nfts
        await nft.connect(owner).mintEquipment(0);
        await nft.connect(acc1).mintEquipment(1);
        await nft.connect(acc2).mintEquipment(2);
        let accounts = [owner.address, acc1.address, acc2.address];
        let ids = [0, 1, 2];
        let result = await nft.balanceOfBatch(accounts, ids)
            //expect 1, 1, 1
        expect(result[0], result[1], result[2]).to.equal(1, 1, 1);
    })

    /// Minting tests
    it("Check if setPublicMintEnabled is not working", async function() {
        await nft.setPublicMintEnabled(false);
        await expect(nft.connect(acc1).mintEquipment(0)).to.be.revertedWith("public mint is disabled");
    })

    it("Check if minting input range limit checks incorrect input", async function() {
        //loop through out of range 
        await nft.setPublicMintEnabled(true);
        for (i = 3; i < 10; i++) {
            await expect(nft.mintEquipment(3)).to.be.revertedWith("It is out of category range");
            await expect(nft.mintEquipment(4)).to.be.revertedWith("It is out of category range");
            await expect(nft.mintEquipment(5)).to.be.revertedWith("It is out of category range");
            await expect(nft.mintEquipment(6)).to.be.revertedWith("It is out of category range");
            await expect(nft.mintEquipment(7)).to.be.revertedWith("It is out of category range");
            await expect(nft.mintEquipment(8)).to.be.revertedWith("It is out of category range");
            await expect(nft.mintEquipment(9)).to.be.revertedWith("It is out of category range");
        }
    })

    it("Check setMappingValue() if Armor nft is correctly minted", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.connect(acc1).mintEquipment(0);
        let val1 = await nft.connect(acc1).getEquipmentSupply(0);
        expect(val1[0]).to.equal("Armor 0")
        expect(val1[1]).to.equal("0")
        expect(val1[2]).to.equal(0)
    })

    it("Check setMappingValue() if Sword nft is correctly minted", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.connect(acc1).mintEquipment(1);
        let val1 = await nft.connect(acc1).getEquipmentSupply(0);
        expect(val1[0]).to.equal("Sword 0");
        expect(val1[1]).to.equal("0");
        expect(val1[2]).to.equal(1)
    })

    it("Check setMappingValue() if Shield nft is correctly minted", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.connect(acc1).mintEquipment(2);
        let val1 = await nft.connect(acc1).getEquipmentSupply(0);
        expect(val1[0]).to.equal("Shield 0")
        expect(val1[1]).to.equal("0")
        expect(val1[2]).to.equal(2)
    })

    it("Check if holder minting is un-callable while public minting is abled", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.connect(acc1).mintEquipment(2);
        await expect(nft.connect(acc1).holderMintEquipment(0, 0)).to.be.revertedWith("public mint is not done");
    })

    it("Check if holder minting is callable while public minting is disabled", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.connect(acc1).mintEquipment(0);
        await nft.setPublicMintEnabled(false);
        await nft.setHolderMintEnabled(true);
        await nft.connect(acc1).holderMintEquipment(0, 0);
        await expect(nft.connect(acc1).mintEquipment(2)).to.be.revertedWith("public mint is disabled");
    })

    it("Check if holder minting is not callable for non-holders", async function() {
        await nft.setPublicMintEnabled(false);
        await nft.setHolderMintEnabled(true);
        await expect(nft.connect(acc1).holderMintEquipment(0, 0)).to.be.revertedWith("Not owning this equipments");
        await expect(nft.connect(acc1).holderMintEquipment(1, 1)).to.be.revertedWith("Not owning this equipments");
        await expect(nft.connect(acc1).holderMintEquipment(2, 0)).to.be.revertedWith("Not owning this equipments");
    })

    it("Check tokenId>1000", async function() {
        await nft.setPublicMintEnabled(true);
        //generate 999 nfts
        for (i = 0; i < 999; i++) {
            await nft.connect(owner).mintEquipment(0);
        }
        //generate 1000th nft, check it works until 1000th nfts.
        await nft.connect(owner).mintEquipment(2);
        let balance = Number(await nft.balanceOf(owner.address, 999));
        expect(balance).to.equal(1);

        // expected to fail
        // 1001th
        await expect(nft.connect(owner).mintEquipment(0)).to.be.revertedWith("public mint is disabled");

        await nft.connect(owner).holderMintEquipment(999, 2);
        balance = Number(await nft.balanceOf(owner.address, 999));
        expect(balance).to.equal(1);
    })

    //burn testing 
    it("Check if burn varification is working", async function() {
        /// 1. account1 mint shield. tId - 1
        /// 2. account2 mint non-shield. tId - 2
        /// 3. account3 mint shield. tId - 3
        await nft.setPublicMintEnabled(true);
        await nft.connect(acc1).mintEquipment(2);
        await nft.connect(acc2).mintEquipment(0);
        await nft.connect(acc3).mintEquipment(2);

        //Case1. acc1 has shield, but trying to burn acc3's shield.
        await expect(nft.connect(acc1).burnShield(2)).to.be.revertedWith("You are not owning this token");
        //Case2. acc2 doesn't have shield, but trying to burn acc3's shield.
        await expect(nft.connect(acc2).burnShield(2)).to.be.revertedWith("You are not owning this token");
        //Case3. acc3 has shield, but trying to burn acc2's Armor
        await expect(nft.connect(acc3).burnShield(1)).to.be.revertedWith("You are not owning this token");
        //Case3. acc2 doesn't have shield, but trying to burn own Armor
        await expect(nft.connect(acc2).burnShield(1)).to.be.revertedWith("Provided tokenId is not shield.");
    })

    it("Check if burn function is working", async function() {
        // when public minting is enabled
        // when random number is 0
        // only burn, done -> can check with the balance of the token id
        await nft.setPublicMintEnabled(true);

        // tId=0
        await nft.connect(acc1).mintEquipment(2);
        let val1 = await nft.connect(acc1).getEquipmentSupply(0);
        //check if acc1 actaully has shield.
        expect(val1[0]).to.equal("Shield 0")

        let balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
        expect(balanceOf0).to.equal(1);
        // tId=0, random number = 0
        await nft.connect(acc1).burnShield(0);
        balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
        expect(balanceOf0).to.equal(0);

    })

    //Random Number test
    it("Check if random number is generated successfully", async function() {
        let randList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let rand1 = Number(await nft.connect(acc1).randomNumber());
        let rand2 = Number(await nft.connect(acc2).randomNumber());
        let rand3 = Number(await nft.connect(acc3).randomNumber());
        expect(rand1).to.be.oneOf(randList);
        expect(rand2).to.be.oneOf(randList);
        expect(rand3).to.be.oneOf(randList);

    });
})