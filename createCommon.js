// create a common DAO
// 
const path = require('path')
const ethers = require('ethers')
const { getArcAndWallet, pathToABIs, CONTRACT_ADDRESSES, WALLET_ADDRESS } = require('./settings')
const {getForgeOrgData, getSetSchemesData } = require('@daostack/common-factory')
// const {getForgeOrgData, getSetSchemesData } = require('commonfactory')
const OVERRIDES =  { gasLimit: 7500000, value: 0}

async function createCommon() {
  let tx;
  let receipt
  const { arc, wallet } = await getArcAndWallet();

  const daoFactoryAbi = require(path.join(pathToABIs, 'DAOFactory.json')).abi
  // getContract does not work the current client version, cf https://github.com/daostack/client/issues/445
  // const contract = arc.getContract(requestToJoinSchemeState.address, abi)

  console.log(`using DAOFactory instance @ ${CONTRACT_ADDRESSES.DAOFactoryInstance}`)
  const daoFactoryContract = new ethers.Contract(CONTRACT_ADDRESSES.DAOFactoryInstance, daoFactoryAbi, wallet)

  const forgeOrgData = 
      getForgeOrgData({
          DAOFactoryInstance: CONTRACT_ADDRESSES.DAOFactoryInstance,
          orgName: 'Created by CommonScripts',
          founderAddresses: [WALLET_ADDRESS],
          repDist: [100]
      })
  // console.log('FORGE ORG DATA: ', forgeOrgData);
  console.log(`Calling DAOFactory.forgeOrg(...)`)
  tx = await daoFactoryContract.forgeOrg(...forgeOrgData, OVERRIDES)
  receipt = await tx.wait()
  // console.log(receipt)
  // get the new avatar address of the thing that was just created..
  const newOrgEvent = receipt.events.filter((e) => e.event === 'NewOrg')[0]
  // console.log(newOrgEvent)
  const newOrgAddress = newOrgEvent.args['_avatar']


  console.log(`Calling DAOFactory.setSchemes(...)`)
  
  // TODO: Use proper IPFS hash
  let ipfsHash = 'metaData'
  // deadline in Ethereum time, where 1 unit = 1 second (I think)
  const deadLine = (await arc.web3.getBlock('latest')).timestamp + 3000
  console.log(deadLine)
  const schemeData = getSetSchemesData({
      DAOFactoryInstance: CONTRACT_ADDRESSES.DAOFactoryInstance,
      avatar: newOrgAddress,
      votingMachine: CONTRACT_ADDRESSES.GenesisProtocol,
      fundingToken: '0x0000000000000000000000000000000000000000',
      minFeeToJoin: 100,
      memberReputation: 100,
      goal: 1000,
      deadLine,
      metaData: ipfsHash,
    })

  console.log('SCHEME DATA: ', schemeData);
  tx = await daoFactoryContract.setSchemes(...schemeData, OVERRIDES)
  receipt = await tx.wait()
  console.log(receipt)

  process.exit(0)
};


createCommon().catch((err) => {console.log(err); process.exit(0)})