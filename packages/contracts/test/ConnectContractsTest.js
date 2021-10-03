const deploymentHelper = require("../utils/deploymentHelpers.js");

contract(
  "Deployment script - Sets correct contract addresses dependencies after deployment",
  async accounts => {
    const [owner] = accounts;

    const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000);

    let priceFeed;
    let usdhToken;
    let sortedTroves;
    let troveManager;
    let activePool;
    let stabilityPool;
    let defaultPool;
    let functionCaller;
    let borrowerOperations;
    let halalStaking;
    let halalToken;
    let communityIssuance;
    let lockupContractFactory;

    before(async () => {
      const coreContracts = await deploymentHelper.deployLiquityCore();
      const HALALContracts = await deploymentHelper.deployHALALContracts(
        bountyAddress,
        lpRewardsAddress,
        multisig
      );

      priceFeed = coreContracts.priceFeedTestnet;
      usdhToken = coreContracts.usdhToken;
      sortedTroves = coreContracts.sortedTroves;
      troveManager = coreContracts.troveManager;
      activePool = coreContracts.activePool;
      stabilityPool = coreContracts.stabilityPool;
      defaultPool = coreContracts.defaultPool;
      functionCaller = coreContracts.functionCaller;
      borrowerOperations = coreContracts.borrowerOperations;

      halalStaking = HALALContracts.halalStaking;
      halalToken = HALALContracts.halalToken;
      communityIssuance = HALALContracts.communityIssuance;
      lockupContractFactory = HALALContracts.lockupContractFactory;

      await deploymentHelper.connectHALALContracts(HALALContracts);
      await deploymentHelper.connectCoreContracts(coreContracts, HALALContracts);
      await deploymentHelper.connectHALALContractsToCore(HALALContracts, coreContracts);
    });

    it("Sets the correct PriceFeed address in TroveManager", async () => {
      const priceFeedAddress = priceFeed.address;

      const recordedPriceFeedAddress = await troveManager.priceFeed();

      assert.equal(priceFeedAddress, recordedPriceFeedAddress);
    });

    it("Sets the correct USDHToken address in TroveManager", async () => {
      const usdhTokenAddress = usdhToken.address;

      const recordedClvTokenAddress = await troveManager.usdhToken();

      assert.equal(usdhTokenAddress, recordedClvTokenAddress);
    });

    it("Sets the correct SortedTroves address in TroveManager", async () => {
      const sortedTrovesAddress = sortedTroves.address;

      const recordedSortedTrovesAddress = await troveManager.sortedTroves();

      assert.equal(sortedTrovesAddress, recordedSortedTrovesAddress);
    });

    it("Sets the correct BorrowerOperations address in TroveManager", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await troveManager.borrowerOperationsAddress();

      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    // ActivePool in TroveM
    it("Sets the correct ActivePool address in TroveManager", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddresss = await troveManager.activePool();

      assert.equal(activePoolAddress, recordedActivePoolAddresss);
    });

    // DefaultPool in TroveM
    it("Sets the correct DefaultPool address in TroveManager", async () => {
      const defaultPoolAddress = defaultPool.address;

      const recordedDefaultPoolAddresss = await troveManager.defaultPool();

      assert.equal(defaultPoolAddress, recordedDefaultPoolAddresss);
    });

    // StabilityPool in TroveM
    it("Sets the correct StabilityPool address in TroveManager", async () => {
      const stabilityPoolAddress = stabilityPool.address;

      const recordedStabilityPoolAddresss = await troveManager.stabilityPool();

      assert.equal(stabilityPoolAddress, recordedStabilityPoolAddresss);
    });

    // HALAL Staking in TroveM
    it("Sets the correct HALALStaking address in TroveManager", async () => {
      const halalStakingAddress = halalStaking.address;

      const recordedHALALStakingAddress = await troveManager.halalStaking();
      assert.equal(halalStakingAddress, recordedHALALStakingAddress);
    });

    // Active Pool

    it("Sets the correct StabilityPool address in ActivePool", async () => {
      const stabilityPoolAddress = stabilityPool.address;

      const recordedStabilityPoolAddress = await activePool.stabilityPoolAddress();

      assert.equal(stabilityPoolAddress, recordedStabilityPoolAddress);
    });

    it("Sets the correct DefaultPool address in ActivePool", async () => {
      const defaultPoolAddress = defaultPool.address;

      const recordedDefaultPoolAddress = await activePool.defaultPoolAddress();

      assert.equal(defaultPoolAddress, recordedDefaultPoolAddress);
    });

    it("Sets the correct BorrowerOperations address in ActivePool", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await activePool.borrowerOperationsAddress();

      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    it("Sets the correct TroveManager address in ActivePool", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await activePool.troveManagerAddress();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // Stability Pool

    it("Sets the correct ActivePool address in StabilityPool", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await stabilityPool.activePool();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    it("Sets the correct BorrowerOperations address in StabilityPool", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await stabilityPool.borrowerOperations();

      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    it("Sets the correct USDHToken address in StabilityPool", async () => {
      const usdhTokenAddress = usdhToken.address;

      const recordedClvTokenAddress = await stabilityPool.usdhToken();

      assert.equal(usdhTokenAddress, recordedClvTokenAddress);
    });

    it("Sets the correct TroveManager address in StabilityPool", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await stabilityPool.troveManager();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // Default Pool

    it("Sets the correct TroveManager address in DefaultPool", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await defaultPool.troveManagerAddress();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    it("Sets the correct ActivePool address in DefaultPool", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await defaultPool.activePoolAddress();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    it("Sets the correct TroveManager address in SortedTroves", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await sortedTroves.borrowerOperationsAddress();
      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    it("Sets the correct BorrowerOperations address in SortedTroves", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await sortedTroves.troveManager();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    //--- BorrowerOperations ---

    // TroveManager in BO
    it("Sets the correct TroveManager address in BorrowerOperations", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await borrowerOperations.troveManager();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // setPriceFeed in BO
    it("Sets the correct PriceFeed address in BorrowerOperations", async () => {
      const priceFeedAddress = priceFeed.address;

      const recordedPriceFeedAddress = await borrowerOperations.priceFeed();
      assert.equal(priceFeedAddress, recordedPriceFeedAddress);
    });

    // setSortedTroves in BO
    it("Sets the correct SortedTroves address in BorrowerOperations", async () => {
      const sortedTrovesAddress = sortedTroves.address;

      const recordedSortedTrovesAddress = await borrowerOperations.sortedTroves();
      assert.equal(sortedTrovesAddress, recordedSortedTrovesAddress);
    });

    // setActivePool in BO
    it("Sets the correct ActivePool address in BorrowerOperations", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await borrowerOperations.activePool();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    // setDefaultPool in BO
    it("Sets the correct DefaultPool address in BorrowerOperations", async () => {
      const defaultPoolAddress = defaultPool.address;

      const recordedDefaultPoolAddress = await borrowerOperations.defaultPool();
      assert.equal(defaultPoolAddress, recordedDefaultPoolAddress);
    });

    // HALAL Staking in BO
    it("Sets the correct HALALStaking address in BorrowerOperations", async () => {
      const halalStakingAddress = halalStaking.address;

      const recordedHALALStakingAddress = await borrowerOperations.halalStakingAddress();
      assert.equal(halalStakingAddress, recordedHALALStakingAddress);
    });

    // --- HALAL Staking ---

    // Sets HALALToken in HALALStaking
    it("Sets the correct HALALToken address in HALALStaking", async () => {
      const halalTokenAddress = halalToken.address;

      const recordedHALALTokenAddress = await halalStaking.halalToken();
      assert.equal(halalTokenAddress, recordedHALALTokenAddress);
    });

    // Sets ActivePool in HALALStaking
    it("Sets the correct ActivePool address in HALALStaking", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await halalStaking.activePoolAddress();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    // Sets USDHToken in HALALStaking
    it("Sets the correct ActivePool address in HALALStaking", async () => {
      const usdhTokenAddress = usdhToken.address;

      const recordedUSDHTokenAddress = await halalStaking.usdhToken();
      assert.equal(usdhTokenAddress, recordedUSDHTokenAddress);
    });

    // Sets TroveManager in HALALStaking
    it("Sets the correct ActivePool address in HALALStaking", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await halalStaking.troveManagerAddress();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // Sets BorrowerOperations in HALALStaking
    it("Sets the correct BorrowerOperations address in HALALStaking", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await halalStaking.borrowerOperationsAddress();
      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    // ---  HALALToken ---

    // Sets CI in HALALToken
    it("Sets the correct CommunityIssuance address in HALALToken", async () => {
      const communityIssuanceAddress = communityIssuance.address;

      const recordedcommunityIssuanceAddress = await halalToken.communityIssuanceAddress();
      assert.equal(communityIssuanceAddress, recordedcommunityIssuanceAddress);
    });

    // Sets HALALStaking in HALALToken
    it("Sets the correct HALALStaking address in HALALToken", async () => {
      const halalStakingAddress = halalStaking.address;

      const recordedHALALStakingAddress = await halalToken.halalStakingAddress();
      assert.equal(halalStakingAddress, recordedHALALStakingAddress);
    });

    // Sets LCF in HALALToken
    it("Sets the correct LockupContractFactory address in HALALToken", async () => {
      const LCFAddress = lockupContractFactory.address;

      const recordedLCFAddress = await halalToken.lockupContractFactory();
      assert.equal(LCFAddress, recordedLCFAddress);
    });

    // --- LCF  ---

    // Sets HALALToken in LockupContractFactory
    it("Sets the correct HALALToken address in LockupContractFactory", async () => {
      const halalTokenAddress = halalToken.address;

      const recordedHALALTokenAddress = await lockupContractFactory.halalTokenAddress();
      assert.equal(halalTokenAddress, recordedHALALTokenAddress);
    });

    // --- CI ---

    // Sets HALALToken in CommunityIssuance
    it("Sets the correct HALALToken address in CommunityIssuance", async () => {
      const halalTokenAddress = halalToken.address;

      const recordedHALALTokenAddress = await communityIssuance.halalToken();
      assert.equal(halalTokenAddress, recordedHALALTokenAddress);
    });

    it("Sets the correct StabilityPool address in CommunityIssuance", async () => {
      const stabilityPoolAddress = stabilityPool.address;

      const recordedStabilityPoolAddress = await communityIssuance.stabilityPoolAddress();
      assert.equal(stabilityPoolAddress, recordedStabilityPoolAddress);
    });
  }
);
