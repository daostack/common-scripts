const path = require('path')
const { Arc } = require('@daostack/client')
const ethers = require('ethers')
// this value should coincide with the "migration-experimental" versoin
const CONTRACT_VERSION = '0.1.1-rc.13'
const NETWORK = 'rinkeby'
const pathToABIs = path.join(require.resolve('@daostack/migration-experimental'), '..', 'contracts', CONTRACT_VERSION)


// not sure where this comes from ..
const CONTRACT_ADDRESSES = require(path.join(require.resolve('@daostack/migration-experimental'), '..', 'migration.json'))
    [NETWORK].package[CONTRACT_VERSION]


// private key of this address: 
const WALLET_ADDRESS = '0xea64B1E098432e12c51694648A21c57ACE7621c4'
const PRIVATE_KEY = 'D865F557C088E1F7BDFB87D359F9E244C73272BDC39CB7CC1898D7A348A4BF2C'

    async function getArcAndWallet() {

    const arc = new Arc({
        graphqlHttpProvider: "https://api.thegraph.com/subgraphs/name/daostack/v7_4_exp_rinkeby",
        graphqlWsProvider: "wss://api.thegraph.com/subgraphs/name/daostack/v7_4_exp_rinkeby",
        web3Provider: `wss://rinkeby.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2`,
    })
    await arc.fetchContractInfos()

    const infuraProvider = new ethers.providers.InfuraProvider('rinkeby', 'e0cdf3bfda9b468fa908aa6ab03d5ba2')
    arc.web3 = infuraProvider

    const wallet = new ethers.Wallet(PRIVATE_KEY, arc.web3)
    return { arc, wallet }
}
module.exports = { 
    WALLET_ADDRESS,
    getArcAndWallet, 
    pathToABIs,
    CONTRACT_ADDRESSES
}