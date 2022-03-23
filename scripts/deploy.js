const ether = require("@openzeppelin/test-helpers/src/ether");
const hre = require("hardhat")
require("@nomiclabs/hardhat-web3")
const { ethers } = require("hardhat");


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function main() {
    // We get the contract to deploy
    const Equipment = await hre.ethers.getContractFactory("Equipment");
    console.log("Deploying The Equipment Contract...");
    let network = process.env.NETWORK ? process.env.NETWORK : "rinkeby"

    console.log(">-> Network is set to " + network)
    const equipment = await Equipment.deploy();

    await equipment.deployed();
    console.log("Equipment Contract deployed to:", equipment.address);

    EquipmentContractAddress = equipment.address;

    await sleep(40000);
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