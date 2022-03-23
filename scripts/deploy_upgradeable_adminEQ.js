const ether = require("@openzeppelin/test-helpers/src/ether");
const { ethers, upgrades } = require('hardhat');
const hre = require("hardhat");
require("@nomiclabs/hardhat-web3");


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function main() {
    // We get the contract to deploy
    const Equipment = await ethers.getContractFactory("Equipment");
    console.log("Deploying The Equipment Contract...");
    let network = process.env.NETWORK ? process.env.NETWORK : "rinkeby"

    console.log(">-> Network is set to " + network)
    const equipment = await upgrades.deployProxy(Equipment, ['0x59076DF5705E883DB552Fb50246b65d97733D1Ef']);
    await equipment.deployed();
    console.log("Equipment Contract deployed to:", equipment.address);

    EquipmentContractAddress = equipment.address;

    await sleep(35000);
    await hre.run("verify:verify", {
        address: equipment.address
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });