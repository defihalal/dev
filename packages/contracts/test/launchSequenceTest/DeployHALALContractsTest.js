const deploymentHelper = require("../../utils/deploymentHelpers.js");
const testHelpers = require("../../utils/testHelpers.js");
const CommunityIssuance = artifacts.require("./CommunityIssuance.sol");

const th = testHelpers.TestHelper;
const timeValues = testHelpers.TimeValues;
const assertRevert = th.assertRevert;
const toBN = th.toBN;
const dec = th.dec;

contract("Deploying the HALAL contracts: LCF, CI, HALALStaking, and HALALToken ", async accounts => {
  const [liquityAG, A, B] = accounts;
  const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000);

  let HALALContracts;

  const oneMillion = toBN(1000000);
  const digits = toBN(1e18);
  const thirtyTwo = toBN(32);
  const expectedCISupplyCap = thirtyTwo.mul(oneMillion).mul(digits);

  beforeEach(async () => {
    // Deploy all contracts from the first account
    HALALContracts = await deploymentHelper.deployHALALContracts(
      bountyAddress,
      lpRewardsAddress,
      multisig
    );
    await deploymentHelper.connectHALALContracts(HALALContracts);

    halalStaking = HALALContracts.halalStaking;
    halalToken = HALALContracts.halalToken;
    communityIssuance = HALALContracts.communityIssuance;
    lockupContractFactory = HALALContracts.lockupContractFactory;

    //HALAL Staking and CommunityIssuance have not yet had their setters called, so are not yet
    // connected to the rest of the system
  });

  describe("CommunityIssuance deployment", async accounts => {
    it("Stores the deployer's address", async () => {
      const storedDeployerAddress = await communityIssuance.owner();

      assert.equal(liquityAG, storedDeployerAddress);
    });
  });

  describe("HALALStaking deployment", async accounts => {
    it("Stores the deployer's address", async () => {
      const storedDeployerAddress = await halalStaking.owner();

      assert.equal(liquityAG, storedDeployerAddress);
    });
  });

  describe("HALALToken deployment", async accounts => {
    it("Stores the multisig's address", async () => {
      const storedMultisigAddress = await halalToken.multisigAddress();

      assert.equal(multisig, storedMultisigAddress);
    });

    it("Stores the CommunityIssuance address", async () => {
      const storedCIAddress = await halalToken.communityIssuanceAddress();

      assert.equal(communityIssuance.address, storedCIAddress);
    });

    it("Stores the LockupContractFactory address", async () => {
      const storedLCFAddress = await halalToken.lockupContractFactory();

      assert.equal(lockupContractFactory.address, storedLCFAddress);
    });

    it("Mints the correct HALAL amount to the multisig's address: (64.66 million)", async () => {
      const multisigHALALEntitlement = await halalToken.balanceOf(multisig);

      const twentyThreeSixes = "6".repeat(23);
      const expectedMultisigEntitlement = "64".concat(twentyThreeSixes).concat("7");
      assert.equal(multisigHALALEntitlement, expectedMultisigEntitlement);
    });

    it("Mints the correct HALAL amount to the CommunityIssuance contract address: 32 million", async () => {
      const communityHALALEntitlement = await halalToken.balanceOf(communityIssuance.address);
      // 32 million as 18-digit decimal
      const _32Million = dec(32, 24);

      assert.equal(communityHALALEntitlement, _32Million);
    });

    it("Mints the correct HALAL amount to the bountyAddress EOA: 2 million", async () => {
      const bountyAddressBal = await halalToken.balanceOf(bountyAddress);
      // 2 million as 18-digit decimal
      const _2Million = dec(2, 24);

      assert.equal(bountyAddressBal, _2Million);
    });

    it("Mints the correct HALAL amount to the lpRewardsAddress EOA: 1.33 million", async () => {
      const lpRewardsAddressBal = await halalToken.balanceOf(lpRewardsAddress);
      // 1.3 million as 18-digit decimal
      const _1pt33Million = "1".concat("3".repeat(24));

      assert.equal(lpRewardsAddressBal, _1pt33Million);
    });
  });

  describe("Community Issuance deployment", async accounts => {
    it("Stores the deployer's address", async () => {
      const storedDeployerAddress = await communityIssuance.owner();

      assert.equal(storedDeployerAddress, liquityAG);
    });

    it("Has a supply cap of 32 million", async () => {
      const supplyCap = await communityIssuance.HALALSupplyCap();

      assert.isTrue(expectedCISupplyCap.eq(supplyCap));
    });

    it("Liquity AG can set addresses if CI's HALAL balance is equal or greater than 32 million ", async () => {
      const HALALBalance = await halalToken.balanceOf(communityIssuance.address);
      assert.isTrue(HALALBalance.eq(expectedCISupplyCap));

      // Deploy core contracts, just to get the Stability Pool address
      const coreContracts = await deploymentHelper.deployLiquityCore();

      const tx = await communityIssuance.setAddresses(
        halalToken.address,
        coreContracts.stabilityPool.address,
        { from: liquityAG }
      );
      assert.isTrue(tx.receipt.status);
    });

    it("Liquity AG can't set addresses if CI's HALAL balance is < 32 million ", async () => {
      const newCI = await CommunityIssuance.new();

      const HALALBalance = await halalToken.balanceOf(newCI.address);
      assert.equal(HALALBalance, "0");

      // Deploy core contracts, just to get the Stability Pool address
      const coreContracts = await deploymentHelper.deployLiquityCore();

      await th.fastForwardTime(timeValues.SECONDS_IN_ONE_YEAR, web3.currentProvider);
      await halalToken.transfer(newCI.address, "31999999999999999999999999", { from: multisig }); // 1e-18 less than CI expects (32 million)

      try {
        const tx = await newCI.setAddresses(
          halalToken.address,
          coreContracts.stabilityPool.address,
          {
            from: liquityAG
          }
        );

        // Check it gives the expected error message for a failed Solidity 'assert'
      } catch (err) {
        assert.include(err.message, "invalid opcode");
      }
    });
  });

  describe("Connecting HALALToken to LCF, CI and HALALStaking", async accounts => {
    it("sets the correct HALALToken address in HALALStaking", async () => {
      // Deploy core contracts and set the HALALToken address in the CI and HALALStaking
      const coreContracts = await deploymentHelper.deployLiquityCore();
      await deploymentHelper.connectHALALContractsToCore(HALALContracts, coreContracts);

      const halalTokenAddress = halalToken.address;

      const recordedHALALTokenAddress = await halalStaking.halalToken();
      assert.equal(halalTokenAddress, recordedHALALTokenAddress);
    });

    it("sets the correct HALALToken address in LockupContractFactory", async () => {
      const halalTokenAddress = halalToken.address;

      const recordedHALALTokenAddress = await lockupContractFactory.halalTokenAddress();
      assert.equal(halalTokenAddress, recordedHALALTokenAddress);
    });

    it("sets the correct HALALToken address in CommunityIssuance", async () => {
      // Deploy core contracts and set the HALALToken address in the CI and HALALStaking
      const coreContracts = await deploymentHelper.deployLiquityCore();
      await deploymentHelper.connectHALALContractsToCore(HALALContracts, coreContracts);

      const halalTokenAddress = halalToken.address;

      const recordedHALALTokenAddress = await communityIssuance.halalToken();
      assert.equal(halalTokenAddress, recordedHALALTokenAddress);
    });
  });
});
