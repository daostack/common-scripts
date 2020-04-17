const { first } = require('rxjs/operators')
const assert = require('assert')
const path = require('path')
const ethers = require('ethers')
const { getArcAndWallet, pathToABIs } = require('./settings')


async function createRequestToJoin() {

    const { arc, wallet } = await getArcAndWallet()
    let tx
    let receipt
    // const daos = await arc.daos().first(); 
    // for (const dao of daos) {
    //     const state = await dao.fetchState()
    //     console.log(state.name)
    // }
    const daos = await arc.daos({where: {name: "Test DAO 76972"}}).first()
    const dao = daos[0]
    const daoState = await dao.fetchState()

    const requestToJoinSchemes = await dao.schemes({where: {name: 'JoinAndQuit'}}).first()
    const requestToJoinScheme = requestToJoinSchemes[0]
    const requestToJoinSchemeState = await requestToJoinScheme.fetchState()
    assert(requestToJoinSchemeState.name === 'JoinAndQuit')
    console.log(requestToJoinSchemeState)

    console.log(`creating a request to join`)
    const abi = require(path.join(pathToABIs, 'JoinAndQuit.json')).abi
    // getContract does not work with inFURE
    // const contract = arc.getContract(requestToJoinSchemeState.address, abi)
    const contract = new ethers.Contract(requestToJoinSchemeState.address, abi, wallet)
    const feeAmount = 101 // this i sthe minimal fee amount + 1
    const descriptionHash = 'some string'
    tx = await contract.proposeToJoin(descriptionHash, feeAmount, { gasLimit: 7500000, value: feeAmount})
    console.log(tx)
    receipt = await tx.wait()
    console.log(receipt)

    process.exit(0)
}

createRequestToJoin().catch((err) => {console.log(err); process.exit(1)})