// create a common DAO
// 
const path = require('path')
const ethers = require('ethers')
const { getArcAndWallet, pathToABIs, DAOFACTORY_ADDRESS, WALLET_ADDRESS } = require('./settings')
const {getForgeOrgData, getSetSchemesData } = require('@daostack/common-factory')
const OVERRIDES =  { gasLimit: 750000, value: 0}

async function createCommon() {
    const { arc, wallet } = await getArcAndWallet();

    const daoFactoryAbi = require(path.join(pathToABIs, 'DAOFactory.json')).abi
    // getContract does not work with inFURE
    // const contract = arc.getContract(requestToJoinSchemeState.address, abi)
    console.log(`using DAOFactory instance @ ${DAOFACTORY_ADDRESS}`)
    const daoFactoryContract = new ethers.Contract(DAOFACTORY_ADDRESS, daoFactoryAbi, wallet)

    const forgeOrgData = 
        getForgeOrgData({
            DAOFactoryInstance: DAOFACTORY_ADDRESS,
            orgName: 'Created by CommonScripts',
            founderAddresses: [WALLET_ADDRESS],
            repDist: [100],
        })
    // console.log('FORGE ORG DATA: ', forgeOrgData);
    console.log(`Calling DAOFactory.forgeOrg(...)`)
    const tx = await daoFactoryContract.forgeOrg(...forgeOrgData, OVERRIDES)
    const result = await tx.wait()
    console.log(result)


    console.log(`Calling DAOFactory.setSchemes(...)`)

//     try {
//       const schemeData = [
//         ...getSetSchemesData({
//           DAOFactoryInstance: '0x565737926597B88da5B851cd2e3d7Ad7F68bAc7F',
//           avatar: '0xbebd9f11b0517a209a2e154635f0dc3d61aa4011',
//           votingMachine: '0x59EC3731Dca0512678A5F6507d79Cf631005cAd4',
//           joinAndQuitVoteParams:
//             '0x1000000000000000000000000000000000000000000000000000000000000000',
//           fundingRequestVoteParams:
//             '0x1100000000000000000000000000000000000000000000000000000000000000',
//           schemeFactoryVoteParams:
//             '0x1110000000000000000000000000000000000000000000000000000000000000',
//           fundingToken: '0x0000000000000000000000000000000000000000',
//           minFeeToJoin: 100,
//           memberReputation: 100,
//           goal: 1000,
//           deadline: (await provider.getBlock('latest')).timestamp + 3000,
//           metaData: ipfsHash,
//         }),
//       ];

//       console.log('SCHEME DATA: ', schemeData);
//       const {hash} = await manager.writeSmartContract(
//         '0x565737926597B88da5B851cd2e3d7Ad7F68bAc7F',
//         DAOFactory,
//         'setSchemes',
//         schemeData,
//       );
//       setTxHash(hash);
//     } catch (e) {
//       throw 'Send transaction failed with error: ' + e;
//     }
//   };
    process.exit(0)
}


createCommon().catch((err) => {console.log(err); process.exit(0)})