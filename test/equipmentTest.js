const { expect, assert } = require("chai")
const chai = require("chai")
const { web3, ethers } = require("hardhat")
const { solidity } = require("ethereum-waffle")
const { BN, time, balance, expectEvent, expectRevert } = require("@openzeppelin/test-helpers")
const ether = require("@openzeppelin/test-helpers/src/ether")

chai.use(solidity);
describe("EquipmentTest", function() {
    this.beforeEach(async function() {
            let mockERC1155Contract = await ethers.getContractFactory("ERC1155Mock");
            mockERC1155 = await mockERC1155Contract.deploy();
            await mockERC1155.deployed()

            let TestContract = await ethers.getContractFactory("Equipment");
            nft = await TestContract.deploy()
            await nft.deployed();
            [owner, acc1, acc2, acc3] = await ethers.getSigners();

            await mockERC1155.setApprovalForAll(nft.address, true, { from: owner.address });
        })
        /// basic test
    it("Simple test...", async function() {
        expect(await nft.owner()).to.equal(owner.address);
    })

    it("Check if setPublicMintEnabled + balanceOf is working", async function() {
            await nft.setPublicMintEnabled(true);

            let balanceOfArmor = Number(await nft.balanceOf(owner.address, 0));
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
            let balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
            expect(balanceOf0).to.equal(0);

            await nft.connect(owner).mintEquipment(0);
            balanceOf0 = Number(await nft.balanceOf(owner.address, 0));
            expect(balanceOf0).to.equal(1);

            await nft.safeTransferFrom(owner.address, acc1.address, 0, 1, 0x00);
            balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));

            expect(balanceOf0).to.equal(1);
        })
        // safeBatchTransferFrom(from, to, ids, amounts, data)
    it("Test for safeBatchTransferFrom function", async function() {
            await nft.setPublicMintEnabled(true);
            let balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
            expect(balanceOf0).to.equal(0);
            await nft.connect(owner).mintEquipment(0);
            await nft.connect(owner).mintEquipment(1);
            await nft.connect(owner).mintEquipment(2);
            balanceOf0 = Number(await nft.balanceOf(owner.address, 0));
            balanceOf1 = Number(await nft.balanceOf(owner.address, 1));
            balanceOf2 = Number(await nft.balanceOf(owner.address, 2));
            expect(balanceOf0 + balanceOf1 + balanceOf2).to.equal(3);

            let ids = [0, 1, 2];
            let amount = [1, 1, 1]

            await nft.safeBatchTransferFrom(owner.address, acc1.address, ids, amount, "0x00");
            balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
            balanceOf1 = Number(await nft.balanceOf(acc1.address, 1));
            balanceOf2 = Number(await nft.balanceOf(acc1.address, 2));

            expect(balanceOf0 + balanceOf1 + balanceOf2).to.equal(3);
        })
        // balanceOfBatch(accounts, ids)
    it("Test for balanceOfBatch function", async function() {
            await nft.setPublicMintEnabled(true);
            //owner - 1
            //acc1 - 1
            //acc2 - 0
            await nft.connect(owner).mintEquipment(0);
            await nft.connect(acc1).mintEquipment(1);
            await nft.connect(acc2).mintEquipment(2);
            let accounts = [owner.address, acc1.address, acc2.address];
            let ids = [0, 1, 0];
            let result = await nft.balanceOfBatch(accounts, ids)
            expect(result[0], result[1], result[2]).to.equal(1, 1, 0);
        })
        // setApprovalForAll(operator, approved)
    it("Test for setApprovalForAll function", async function() {

        })
        // isApprovedForAll(account, operator)
    it("Test for isApprovedForAll function", async function() {

    })

    /// Minting tests
    it("Check if setPublicMintEnabled is not working", async function() {
        await nft.setPublicMintEnabled(false);
        await expect(nft.mintEquipment(0)).to.be.revertedWith("public mint is currently disabled");
    })

    it("Check if minting input range limit checks incorrect input", async function() {
        /// can use loop
        await nft.setPublicMintEnabled(true);
        await expect(nft.mintEquipment(3)).to.be.revertedWith("It is out of category range");
        await expect(nft.mintEquipment(4)).to.be.revertedWith("It is out of category range");
        await expect(nft.mintEquipment(5)).to.be.revertedWith("It is out of category range");
        await expect(nft.mintEquipment(6)).to.be.revertedWith("It is out of category range");
        await expect(nft.mintEquipment(7)).to.be.revertedWith("It is out of category range");
    })

    it("Check setMappingValue() if Armor nft is correctly minted", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.mintEquipment(0);
        let val1 = await nft.getEquipmentSupply(0);
        expect(val1[0]).to.equal("Armor 0")
        expect(val1[1]).to.equal("0")
        expect(val1[2]).to.equal(0)
    })

    it("Check setMappingValue() if Sword nft is correctly minted", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.mintEquipment(1);
        let val1 = await nft.getEquipmentSupply(0);
        expect(val1[0]).to.equal("Sword 0");
        expect(val1[1]).to.equal("0");
        expect(val1[2]).to.equal(1)
    })

    it("Check setMappingValue() if Shield nft is correctly minted", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.mintEquipment(2);
        let val1 = await nft.getEquipmentSupply(0);
        expect(val1[0]).to.equal("Shield 0")
        expect(val1[1]).to.equal("0")
        expect(val1[2]).to.equal(2)
    })

    it("Check if holder minting is un-callable while public minting is abled", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.mintEquipment(2);
        await expect(nft.holderMintEquipment(0, 0)).to.be.revertedWith("public mint is not done");
    })

    it("Check if holder minting is callable while public minting is disabled", async function() {
        await nft.setPublicMintEnabled(true);
        await nft.mintEquipment(0);
        await nft.setPublicMintEnabled(false);
        await nft.setHolderMintEnabled(true);
        await nft.holderMintEquipment(0, 0);
        await expect(nft.mintEquipment(2)).to.be.revertedWith("public mint is currently disabled");
    })

    it("Check if holder minting is not callable for non-holders", async function() {
        await nft.setPublicMintEnabled(false);
        await nft.setHolderMintEnabled(true);
        await expect(nft.holderMintEquipment(0, 0)).to.be.revertedWith("you are not owning any equipments");
        await expect(nft.holderMintEquipment(1, 1)).to.be.revertedWith("you are not owning any equipments");
        await expect(nft.holderMintEquipment(2, 0)).to.be.revertedWith("you are not owning any equipments");
    })

    it("Check if holder minting is not callable for non-holders", async function() {
            await nft.setPublicMintEnabled(false);
            await nft.setHolderMintEnabled(true);
            await expect(nft.holderMintEquipment(0, 0)).to.be.revertedWith("you are not owning any equipments");
            await expect(nft.holderMintEquipment(1, 1)).to.be.revertedWith("you are not owning any equipments");
            await expect(nft.holderMintEquipment(2, 0)).to.be.revertedWith("you are not owning any equipments");
        })
        //1. negative -> 퍼블릭
        //2. positive -> holder
        // it("Check tokenId>1000", async function() {
        //     await nft.setPublicMintEnabled(true);
        //     for (i = 0; i < 999; i++) {
        //         await nft.connect(owner).mintEquipment(0);
        //     }
        //     await nft.connect(owner).mintEquipment(2);
        //     let balance = Number(await nft.balanceOf(owner.address, 998));
        //     expect(balance).to.equal(1);

    //     // expected to fail
    //     // 1001th
    //     await expect(nft.connect(owner).mintEquipment(0)).to.be.revertedWith("public mint is currently disabled");

    //     await nft.connect(owner).holderMintEquipment(998, 2);
    //     balance = Number(await nft.balanceOf(owner.address, 999));
    //     expect(balance).to.equal(1);
    // })

    //burn testing 
    it("Check if burn varification is working", async function() {
        /// 1. account1 needs to mint shield.
        /// 2. account2 needs to mint non-shield
        /// 3. account3 needs to mint shield
        await nft.setPublicMintEnabled(true);
        //tId=0
        await nft.connect(acc1).mintEquipment(2);
        //tId=1
        await nft.connect(acc2).mintEquipment(0);
        //tId=2
        await nft.connect(acc3).mintEquipment(2);
        /// 4. check if account1 can burn a shield of account3, reverted with "You are not owning this token"
        await expect(nft.connect(acc1).burnShield(2)).to.be.revertedWith("You are not owning this token");
        await expect(nft.connect(acc2).burnShield(2)).to.be.revertedWith("You are not owning this token");
        await expect(nft.connect(acc3).burnShield(1)).to.be.revertedWith("You are not owning this token");
        /// 5. check if account2 cannot burn, reverted with "your provided tokenId is not shield. You cannot burn"
        await expect(nft.connect(acc2).burnShield(1)).to.be.revertedWith("Provided tokenId is not shield. You cannot burn");
    })

    // it("Check if burn function is working", async function() {
    //     // 1. when public minting is enabled
    //     // - when random number is 0
    //     // only burn, done -> can check with the balance of the token id
    //     // - when random number is not 0
    //     // burn, mint sword -> check balance of it
    //     // 2. when public is done and holder minting 
    //     // - when random number is 0
    //     // only burn, done
    //     // - when random number is not 0
    //     // burn, mint sword -> check balance of it
    //     await nft.setPublicMintEnabled(true);

    //     // tId=0
    //     await nft.connect(acc1).mintEquipment(2);
    //     let val1 = await nft.connect(acc1).getEquipmentSupply(0);
    //     //check if acc1 actaully has shield.
    //     expect(val1[0]).to.equal("Shield 0")

    //     let balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
    //     expect(balanceOf0).to.equal(1);
    //     // tId=0, random number = 0
    //     await nft.connect(acc1).burnShield(0);
    //     balanceOf0 = Number(await nft.balanceOf(acc1.address, 0));
    //     expect(balanceOf0).to.equal(0);

    //     // tId=1, random number = 1
    //     // burn 하고나면 토큰아이디가 뭐지? -> 그냥 +1
    //     await nft.connect(acc1).mintEquipment(2);
    //     val1 = await nft.getEquipmentSupply(1);
    //     await nft.connect(acc1).burnShield(1);
    //     //We suppose the minting function is working. 
    //     //sword's tId is supposed to be 2
    //     val1 = await nft.getEquipmentSupply(2);
    //     expect(val1[0]).to.equal("Sword 2")


    //     await nft.connect(acc2).mintEquipment(2);
    //     await nft.setPublicMintEnabled(false);
    //     await nft.setHolderMintEnabled(true);
    //     // tId=3
    //     val1 = await nft.connect(acc2).getEquipmentSupply(3);
    //     //check if acc1 actaully has shield.
    //     expect(val1[0]).to.equal("Shield 3");

    //     await nft.connect(acc2).burnShield(3);
    //     //We suppose the minting function is working. 
    //     //sword's tId is supposed to be 4.
    //     val1 = await nft.getEquipmentSupply(4);
    //     expect(val1[0]).to.equal("Sword 4");
    // })

    //VRF test
    it("Check if random number is generated successfully", async function() {
        let randList = [0, 1, 2, 3, 4];
        let rand1 = Number(await nft.connect(acc1).randomNumber(5));
        let rand2 = Number(await nft.connect(acc2).randomNumber(5));
        let rand3 = Number(await nft.connect(acc3).randomNumber(5));
        expect(rand1).to.be.oneOf(randList);
        expect(rand2).to.be.oneOf(randList);
        expect(rand3).to.be.oneOf(randList);

    });
    //Upgradable test
})