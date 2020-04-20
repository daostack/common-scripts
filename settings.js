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
const ADDRESS_1 = '0xea64B1E098432e12c51694648A21c57ACE7621c4'
const PRIVATE_KEY_1 = 'D865F557C088E1F7BDFB87D359F9E244C73272BDC39CB7CC1898D7A348A4BF2C'

const ADDRESS_2 = '0xb8a15CD235b34F52D5FeD7155dF2C07DE594e03e'
const PRIVATE_KEY_2 = '015ECB47E92655A52A0A3ECF38D1CD3F4599CD09166A0FAC48F507F341F7C0FF'

async function getArc() {

    const arc = new Arc({
        graphqlHttpProvider: "https://api.thegraph.com/subgraphs/name/daostack/v7_4_exp_rinkeby",
        graphqlWsProvider: "wss://api.thegraph.com/subgraphs/name/daostack/v7_4_exp_rinkeby",
        web3Provider: `wss://rinkeby.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2`,
    })
    await arc.fetchContractInfos()

    const infuraProvider = new ethers.providers.InfuraProvider('rinkeby', 'e0cdf3bfda9b468fa908aa6ab03d5ba2')
    arc.web3 = infuraProvider

    return arc
}
const OVERRIDES =  { 
    gasLimit: 10000000,
    gasPrice: 1000000000,
 }

module.exports = { 
    ADDRESS_1,
    PRIVATE_KEY_1,
    ADDRESS_2,
    PRIVATE_KEY_2,
    getArc, 
    pathToABIs,
    CONTRACT_ADDRESSES,
    OVERRIDES
}