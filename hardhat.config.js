/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle")
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config()
require("@nomiclabs/hardhat-web3")
require("@nomiclabs/hardhat-etherscan")

module.exports = {
    networks: {
        rinkeby: {
            url: process.env.RINKEBY_URL || "",
            chainId: 4,
            accounts: [
                process.env.PRIVATE_KEY_USER,
            ].filter((x) => x !== undefined),
        },
        kovan: {
            url: process.env.KOVAN_URL || "",
            chainId: 42,
            accounts: [
                process.env.PRIVATE_KEY_USER,
            ].filter((x) => x !== undefined),
        },
        mumbai: {
            url: process.env.MUMBAI_URL || "",
            chainId: 80001,
            accounts: [
                process.env.PRIVATE_KEY_DEPLOYER,
            ].filter((x) => x !== undefined),
        },
        polygon: {
            url: process.env.POLYGON_URL || "",
            chainId: 137,
            accounts: [
                process.env.PRIVATE_KEY_DEPLOYER,
            ].filter((x) => x !== undefined),
        },
        mainnet: {
            url: process.env.MAINNET_URL || "",
            chainId: 1,
            accounts: [
                process.env.PRIVATE_KEY_DEPLOYER,
            ].filter((x) => x !== undefined),
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
            4: 0,
        },
    },
    solidity: {
        compilers: [{
                version: "0.8.3",
            },
            {
                version: "0.6.6",
            },
            {
                version: "0.4.24",
            },
        ],
    },
    mocha: {
        timeout: 10000000,
    },
};