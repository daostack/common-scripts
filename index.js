const { Arc } = require('@daostack/client-experimental')
const { first } = require('rxjs/operators')
const assert = require('assert')
const path = require('path')

const CONTRACT_VERSION = '0.1.1-rc.12'
const pathToABIs = path.join(require.resolve('@daostack/migration-experimental'), '..', 'contracts', CONTRACT_VERSION)



async function triggerEvent() {

    // latest settings are from https://daostack1.atlassian.net/wiki/spaces/CMN/pages/11731016/Developer+Resources
    const arc = new Arc({
        graphqlHttpProvider: "https://api.thegraph.com/subgraphs/name/daostack/v7_2_exp_rinkeby",
        graphqlWsProvider: "wss://api.thegraph.com/subgraphs/name/daostack/v7_2_exp_rinkeby",
        web3Provider: `wss://rinkeby.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2`,
    })
    await arc.fetchContractInfos()

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
        const contract = arc.getContract(requestToJoinSchemeState.address, abi)
        const method = 'proposeToJoin'
        const feeAmount = 10
        const descriptionHash = 'xxx'

        const args = [
           descriptionHash, 
           feeAmount
        ] 
        const tx = arc.sendTransaction({ contract, method, args})
        const result = await tx.send()
        console.log(result)
        

    }

    process.exit(0)
}

triggerEvent().catch((err) => {console.log(err); process.exit(0)})
