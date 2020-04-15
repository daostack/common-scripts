const { Arc } = require('@daostack/client-experimental')
const { first } = require('rxjs/operators')
const assert = require('assert')
const path = require('path')
const ethers = require('ethers')

const CONTRACT_VERSION = '0.1.1-rc.12'
const pathToABIs = path.join(require.resolve('@daostack/migration-experimental'), '..', 'contracts', CONTRACT_VERSION)

// private key of this address: 0xea64B1E098432e12c51694648A21c57ACE7621c4
const PRIVATE_KEY = 'D865F557C088E1F7BDFB87D359F9E244C73272BDC39CB7CC1898D7A348A4BF2C'



async function triggerEvent() {

    // latest settings are from https://daostack1.atlassian.net/wiki/spaces/CMN/pages/11731016/Developer+Resources
    const arc = new Arc({
        graphqlHttpProvider: "https://api.thegraph.com/subgraphs/name/daostack/v7_2_exp_rinkeby",
        graphqlWsProvider: "wss://api.thegraph.com/subgraphs/name/daostack/v7_2_exp_rinkeby",
        web3Provider: `wss://rinkeby.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2`,
    })
    await arc.fetchContractInfos()

    const infuraProvider = new ethers.providers.InfuraProvider('rinkeby', 'e0cdf3bfda9b468fa908aa6ab03d5ba2')
    arc.web3 = infuraProvider

    const wallet = new ethers.Wallet(PRIVATE_KEY, arc.web3)

    // balance of current account


    // get a list of DAOs
    const daos = await arc.daos({where: {name: "DAOlightful"}}).first()
    const dao = daos[0]
    const daoState = await dao.fetchState()

    console.log(`using dao ${daoState.name}`)
    const schemes = await dao.schemes().pipe(first()).toPromise()
    // console.log(schemes)
    console.log('Schemes in this DAO')
    for (const scheme of schemes) {
        schemeState = await scheme.fetchState()
        console.log(`- ${schemeState.name}`)
    }
    // let's create a requestToJoin proposal
    const requestToJoinSchemes = await dao.schemes({where: {name: 'JoinAndQuit'}}).first()
    const requestToJoinScheme = requestToJoinSchemes[0]
    const requestToJoinSchemeState = await requestToJoinScheme.fetchState()
    assert(requestToJoinSchemeState.name === 'JoinAndQuit')
    // create a proposal
    const proposals = await requestToJoinScheme.proposals().first()
    console.log(proposals)
    if (proposals.length === 0) {
        // there are no proposals in this scheme, so let's create one
        console.log(`Creating a new proposal`)
        // The client does not support the fundingrequest scheme yet, otherwise we could have 
        // created the proposal in the following way:
        // await fundingRequestScheme.createProposal(... arguments).send()
        // instead, we have to get the contract and call the method ourselves
        // the FundingRequest code lives here:
        // https://github.com/daostack/arc/blob/arc-factory/contracts/schemes/FundingRequest.sol
        // the request to join lives here:
        // https://github.com/daostack/arc/blob/arc-factory/contracts/schemes/JoinAndQuit.sol
        // console.log(fundingRequestSchemeState)
        const abi = require(path.join(pathToABIs, 'JoinAndQuit.json')).abi
        // getContract does not work with inFURE
        // const contract = arc.getContract(requestToJoinSchemeState.address, abi)
        const contract = new ethers.Contract(requestToJoinSchemeState.address, abi, wallet)
        const method = 'proposeToJoin'
        const feeAmount = 101 // this i sthe minimal fee amount
        const descriptionHash = 'some string'

        const args = [
           descriptionHash, 
           feeAmount
        ] 
        let tx
        try {
            tx = await contract.proposeToJoin(descriptionHash, feeAmount, { gasLimit: 750000, value: feeAmount})
        } catch (err) {
            console.log(err)
            console.log(err.reason)
            throw err
        }
        // console.log(tx)
        console.log(`Waiting for the transaction to be mined...`)
        let result
        try {
            result = await tx.wait()
        } catch (err) {
            console.log(err)
            console.log(err.reason)
            throw err
        }
        console.log(result)
        // instead of the wollofinw lines, which are not working with infura + ethers.js
        // const tx = arc.sendTransaction({ contract, method, args})
        // const result = await tx.send()
        

    }

    process.exit(0)
}

triggerEvent().catch((err) => {console.log(err); process.exit(0)})
