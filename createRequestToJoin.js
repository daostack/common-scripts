const assert = require('assert')
const path = require('path')
const ethers = require('ethers')
const { getArc, pathToABIs, PRIVATE_KEY_2, ADDRESS_2, OVERRIDES } = require('./settings')


async function createRequestToJoin() {

    const arc = await getArc()
    let tx
    let receipt
    const wallet = new ethers.Wallet(PRIVATE_KEY_2, arc.web3)
    // const daos = await arc.daos().first(); 
    // for (const dao of daos) {
    //     const state = await dao.fetchState()
    //     console.log(state.name)
    // }
    const daos = await arc.daos({where: {name: "Test DAO 74721"}}).first()
    const dao = daos[0]
    // const daoState = await dao.fetchState()

    const requestToJoinSchemes = await dao.schemes({where: {name: 'JoinAndQuit'}}).first()
    const requestToJoinScheme = requestToJoinSchemes[0]
    const requestToJoinSchemeState = await requestToJoinScheme.fetchState()
    assert(requestToJoinSchemeState.name === 'JoinAndQuit')
    // console.log(requestToJoinSchemeState)

    console.log(`creating a request to join`)
    const abi = require(path.join(pathToABIs, 'JoinAndQuit.json')).abi
    // getContract does not work with inFURE
    // const contract = arc.getContract(requestToJoinSchemeState.address, abi)
    const contract = new ethers.Contract(requestToJoinSchemeState.address, abi, wallet)
    const feeAmount = 101 // this i sthe minimal fee amount + 1
    const descriptionHash = 'some string'
    tx = await contract.proposeToJoin(descriptionHash, feeAmount, { ...OVERRIDES, value: feeAmount})
    console.log(`Waiting for transaction ${tx.hash} to be mined`)
    receipt = await tx.wait()
    console.log(receipt)

    process.exit(0)
}

createRequestToJoin().catch((err) => {console.log(err); process.exit(1)})