// scripts/upgrade_box.js
const { ethers, upgrades } = require('hardhat');


const proxyAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
async function main() {
    console.log(proxyAddress, " original Box(proxy) address")
    const EquipmentV2 = await ethers.getContractFactory('Equipment2');
    console.log('Upgrading EquipmentV2...');
    const equipmentV2 = await upgrades.upgradeProxy(proxyAddress, EquipmentV2);
    console.log(equipmentV2.address, 'EquipmentV2 upgraded');

    console.log(await upgrades.erc1967.getImplementationAddress(equipmentV2.address), " getImplementationAddress")
    console.log(await upgrades.erc1967.getAdminAddress(equipmentV2.address), " getAdminAddress")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})