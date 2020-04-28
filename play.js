const { first } = require('rxjs/operators')
const assert = require('assert')
const path = require('path')
const ethers = require('ethers')
const { getArcAndWallet, pathToABIs, OVERRIDES } = require('./settings')
const { DAO } = require('@daostack/arc.js')



async function play() {

    const { arc, wallet } = await getArcAndWallet()
    // latest settings are from https://daostack1.atlassian.net/wiki/spaces/CMN/pages/11731016/Developer+Resources
   // balance of current account


    const dao = new DAO(arc, '0x18442c41a9869484a63eb37b6bd843088e7d4582')
    const daoState = await dao.fetchState()

    console.log(`using dao ${daoState.name}`)
    const schemes = await dao.schemes().pipe(first()).toPromise()
    console.log('Schemes in this DAO')
    for (const scheme of schemes) {
        const schemeState = await scheme.fetchState()
        console.log(`- ${schemeState.name}`)
    }
    // let's create a requestToJoin proposal
    const scheme = (await dao.schemes({where: {name: 'GenericScheme'}}).first())[0]
    const schemeState = await scheme.fetchState()
    assert(schemeState.name === 'GenericScheme')
    // create a proposal
    const proposals = await scheme.proposals().first()
    console.log(proposals)
    if (proposals.length === 0) {
        // there are no proposals in this scheme, so let's create one
        console.log(`Creating a new proposal`)
        // The client does not support the fundingrequest scheme yet, otherwise we could have 
        // created the proposal in the following way:
        const abi = require(path.join(pathToABIs, 'GenericScheme.json')).abi
        // getContract does not work with INFURA
        // const contract = arc.getContract(requestToJoinSchemeState.address, abi)
        const contract = new ethers.Contract(schemeState.address, abi, wallet)
        const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
        const callData = '0x'
        const tx = await contract.proposeCall(callData, 0, NULL_HASH, OVERRIDES)
        console.log(tx)
        const receipt = await tx.wait()
        console.log(receipt)
        // const contract = arc.getContract(requestToJoinSchemeState.address, abi)
        
    }

    process.exit(0)
}

play().catch((err) => {console.log(err); process.exit(0)})
