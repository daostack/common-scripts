const { first } = require('rxjs/operators')
const assert = require('assert')
const path = require('path')
const ethers = require('ethers')
const { getArc, pathToABIs, WALLET_1, OVERRIDES } = require('./settings')


async function createFundingRequest() {

    const arc = await getArcAndWallet()
    let tx
    let receipt
    const wallet = new ethers.Wallet(PRIVATE_KEY_2, arc.web3)
    const daos = await arc.daos({where: {name: "Test DAO 76972"}}).first()
    const dao = daos[0]
    const daoState = await dao.fetchState()

    const fundingRequestSchemes = await dao.schemes({where: {name: 'FundingRequest'}}).first()
    const fundingRequestScheme = fundingRequestSchemes[0]
    const fundingRequestSchemeState = await fundingRequestScheme.fetchState()
    assert(fundingRequestSchemeState.name === 'JoinAndQuit')
    console.log(fundingRequestSchemeState)

    console.log(`creating a request to join`)
    const abi = require(path.join(pathToABIs, 'FundingRequest.json')).abi
    // getContract does not work with inFURE
    // const contract = arc.getContract(fundingRequestSchemeState.address, abi)
    const contract = new ethers.Contract(fundingRequestSchemeState.address, abi, wallet)
    const beneficiary = WALLET_ADDRESS
    const amount = 200 // this i sthe minimal fee amount + 1
    const descriptionHash = 'some string'
    tx = await contract.propose(beneficiary, amount, descriptionHash, OVERRIDES)
    console.log(tx)
    receipt = await tx.wait()
    console.log(receipt)

    process.exit(0)
}

createFundingRequest().catch((err) => {console.log(err); process.exit(1)})