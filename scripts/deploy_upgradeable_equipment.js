// scripts/upgrade_box.js
const { ethers, upgrades } = require('hardhat');

async function main() {
    const EquipmentV2 = await ethers.getContractFactory('EquipmentV2');
    console.log('Upgrading EquipmentV2...');
    await upgrades.upgradeProxy('0xCF1de5A9Cb10Ca69F2048b17aA8482C65A643C78', EquipmentV2);
    console.log('EquipmentV2 upgraded');
}

main();