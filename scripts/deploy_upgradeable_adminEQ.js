// scripts/deploy_upgradeable_adminbox.js
const { ethers, upgrades } = require('hardhat');

async function main() {
    const Admin = await ethers.getContractFactory('AdminEquipment');
    console.log('Deploying AdminEquipment...');
    const adminEquipment = await upgrades.deployProxy(AdminEquipment, ['0xCF1de5A9Cb10Ca69F2048b17aA8482C65A643C78'], { initializer: 'initialize' });
    await adminEquipment.deployed();
    console.log('AdminEquipment deployed to:', adminEquipment.address);
}

main();