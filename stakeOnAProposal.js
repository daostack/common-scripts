// get some arbitrary test proposal and stake on it
const path = require('path')
const ethers = require('ethers')
const { getArc, pathToABIs, PRIVATE_KEY_2, ADDRESS_2 } = require('./settings')
const { Proposal, IProposalOutcome, BN, OVERRIDES } = require('@daostack/arc.js')


// NOTE THAT THESE ADDRESSES MAY not work after 
const PROPOSAL_ID = '0xa6917952bfd9007a3b6335bb5b129256fa24e89a8a17ac220be34b5442cf1c3a' // the proposal we are staking on (created with npm run createRequestToJoin)
const VOTING_MACHINE = '0xf109310612daada3fbd979f8e635db7710cfee46'

async function doit() {
    console.log(`staking on proposal ${PROPOSAL_ID}`)
    const arc = await getArc()
    const path = require('path')
    const wallet = new ethers.Wallet(PRIVATE_KEY_2, arc.web3)

    // 
    // const proposal = await new Proposal(arc, PROPOSAL_ID)
    // const receipt = await proposal.stake(IProposalOutcome.Pass, 100).send()
    // console.log(receipt)
    // const proposalState = await proposal.fetchState()
    // const contractAddress = await proposalState.votingMachine


    contractAddress = VOTING_MACHINE
    const abi = require(path.join(pathToABIs, 'GenesisProtocol.json')).abi
    const contract = new ethers.Contract(contractAddress, abi, wallet)
    const outcome = 1
    const amountToStake = 100
    console.log(contract.stake.length)
    tx = await contract.stake(PROPOSAL_ID, outcome, amountToStake, OVERRIDES)
    console.log(`Waiting for transaction ${tx.hash} to be mined`)
    receipt = await tx.wait()
    console.log(receipt)




    process.exit(0)
}

doit().catch((err) => {console.log(err); process.exit(1)})