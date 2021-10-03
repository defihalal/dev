const deploymentHelper = require("../utils/deploymentHelpers.js");
const testHelpers = require("../utils/testHelpers.js");

const { keccak256 } = require("@ethersproject/keccak256");
const { defaultAbiCoder } = require("@ethersproject/abi");
const { toUtf8Bytes } = require("@ethersproject/strings");
const { pack } = require("@ethersproject/solidity");
const { hexlify } = require("@ethersproject/bytes");
const { ecsign } = require("ethereumjs-util");

const { toBN, assertRevert, assertAssert, dec, ZERO_ADDRESS } = testHelpers.TestHelper;

const sign = (digest, privateKey) => {
  return ecsign(Buffer.from(digest.slice(2), "hex"), Buffer.from(privateKey.slice(2), "hex"));
};

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
);

// Gets the EIP712 domain separator
const getDomainSeparator = (name, contractAddress, chainId, version) => {
  return keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        keccak256(
          toUtf8Bytes(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
          )
        ),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes(version)),
        parseInt(chainId),
        contractAddress.toLowerCase()
      ]
    )
  );
};

// Returns the EIP712 hash which should be signed by the user
// in order to make a call to `permit`
const getPermitDigest = (
  name,
  address,
  chainId,
  version,
  owner,
  spender,
  value,
  nonce,
  deadline
) => {
  const DOMAIN_SEPARATOR = getDomainSeparator(name, address, chainId, version);
  return keccak256(
    pack(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
            [PERMIT_TYPEHASH, owner, spender, value, nonce, deadline]
          )
        )
      ]
    )
  );
};

contract("USDHToken", async accounts => {
  const [owner, alice, bob, carol, dennis] = accounts;

  const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000);

  // the second account our hardhatenv creates (for Alice)
  // from https://github.com/liquity/dev/blob/main/packages/contracts/hardhatAccountsList2k.js#L3
  const alicePrivateKey = "0xeaa445c85f7b438dEd6e831d06a4eD0CEBDc2f8527f84Fcda6EBB5fCfAd4C0e9";

  let chainId;
  let usdhTokenOriginal;
  let usdhTokenTester;
  let stabilityPool;
  let troveManager;
  let borrowerOperations;

  let tokenName;
  let tokenVersion;

  const testCorpus = ({ withProxy = false }) => {
    beforeEach(async () => {
      const contracts = await deploymentHelper.deployTesterContractsHardhat();

      const HALALContracts = await deploymentHelper.deployHALALContracts(
        bountyAddress,
        lpRewardsAddress,
        multisig
      );

      await deploymentHelper.connectCoreContracts(contracts, HALALContracts);
      await deploymentHelper.connectHALALContracts(HALALContracts);
      await deploymentHelper.connectHALALContractsToCore(HALALContracts, contracts);

      usdhTokenOriginal = contracts.usdhToken;
      if (withProxy) {
        const users = [alice, bob, carol, dennis];
        await deploymentHelper.deployProxyScripts(contracts, HALALContracts, owner, users);
      }

      usdhTokenTester = contracts.usdhToken;
      // for some reason this doesn’t work with coverage network
      //chainId = await web3.eth.getChainId()
      chainId = await usdhTokenOriginal.getChainId();

      stabilityPool = contracts.stabilityPool;
      troveManager = contracts.stabilityPool;
      borrowerOperations = contracts.borrowerOperations;

      tokenVersion = await usdhTokenOriginal.version();
      tokenName = await usdhTokenOriginal.name();

      // mint some tokens
      if (withProxy) {
        await usdhTokenOriginal.unprotectedMint(usdhTokenTester.getProxyAddressFromUser(alice), 150);
        await usdhTokenOriginal.unprotectedMint(usdhTokenTester.getProxyAddressFromUser(bob), 100);
        await usdhTokenOriginal.unprotectedMint(usdhTokenTester.getProxyAddressFromUser(carol), 50);
      } else {
        await usdhTokenOriginal.unprotectedMint(alice, 150);
        await usdhTokenOriginal.unprotectedMint(bob, 100);
        await usdhTokenOriginal.unprotectedMint(carol, 50);
      }
    });

    it("balanceOf(): gets the balance of the account", async () => {
      const aliceBalance = (await usdhTokenTester.balanceOf(alice)).toNumber();
      const bobBalance = (await usdhTokenTester.balanceOf(bob)).toNumber();
      const carolBalance = (await usdhTokenTester.balanceOf(carol)).toNumber();

      assert.equal(aliceBalance, 150);
      assert.equal(bobBalance, 100);
      assert.equal(carolBalance, 50);
    });

    it("totalSupply(): gets the total supply", async () => {
      const total = (await usdhTokenTester.totalSupply()).toString();
      assert.equal(total, "300"); // 300
    });

    it("name(): returns the token's name", async () => {
      const name = await usdhTokenTester.name();
      assert.equal(name, "USDH Stablecoin");
    });

    it("symbol(): returns the token's symbol", async () => {
      const symbol = await usdhTokenTester.symbol();
      assert.equal(symbol, "USDH");
    });

    it("decimal(): returns the number of decimal digits used", async () => {
      const decimals = await usdhTokenTester.decimals();
      assert.equal(decimals, "18");
    });

    it("allowance(): returns an account's spending allowance for another account's balance", async () => {
      await usdhTokenTester.approve(alice, 100, { from: bob });

      const allowance_A = await usdhTokenTester.allowance(bob, alice);
      const allowance_D = await usdhTokenTester.allowance(bob, dennis);

      assert.equal(allowance_A, 100);
      assert.equal(allowance_D, "0");
    });

    it("approve(): approves an account to spend the specified amount", async () => {
      const allowance_A_before = await usdhTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_before, "0");

      await usdhTokenTester.approve(alice, 100, { from: bob });

      const allowance_A_after = await usdhTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_after, 100);
    });

    if (!withProxy) {
      it("approve(): reverts when spender param is address(0)", async () => {
        const txPromise = usdhTokenTester.approve(ZERO_ADDRESS, 100, { from: bob });
        await assertAssert(txPromise);
      });

      it("approve(): reverts when owner param is address(0)", async () => {
        const txPromise = usdhTokenTester.callInternalApprove(ZERO_ADDRESS, alice, dec(1000, 18), {
          from: bob
        });
        await assertAssert(txPromise);
      });
    }

    it("transferFrom(): successfully transfers from an account which is it approved to transfer from", async () => {
      const allowance_A_0 = await usdhTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_0, "0");

      await usdhTokenTester.approve(alice, 50, { from: bob });

      // Check A's allowance of Bob's funds has increased
      const allowance_A_1 = await usdhTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_1, 50);

      assert.equal(await usdhTokenTester.balanceOf(carol), 50);

      // Alice transfers from bob to Carol, using up her allowance
      await usdhTokenTester.transferFrom(bob, carol, 50, { from: alice });
      assert.equal(await usdhTokenTester.balanceOf(carol), 100);

      // Check A's allowance of Bob's funds has decreased
      const allowance_A_2 = await usdhTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_2, "0");

      // Check bob's balance has decreased
      assert.equal(await usdhTokenTester.balanceOf(bob), 50);

      // Alice tries to transfer more tokens from bob's account to carol than she's allowed
      const txPromise = usdhTokenTester.transferFrom(bob, carol, 50, { from: alice });
      await assertRevert(txPromise);
    });

    it("transfer(): increases the recipient's balance by the correct amount", async () => {
      assert.equal(await usdhTokenTester.balanceOf(alice), 150);

      await usdhTokenTester.transfer(alice, 37, { from: bob });

      assert.equal(await usdhTokenTester.balanceOf(alice), 187);
    });

    it("transfer(): reverts if amount exceeds sender's balance", async () => {
      assert.equal(await usdhTokenTester.balanceOf(bob), 100);

      const txPromise = usdhTokenTester.transfer(alice, 101, { from: bob });
      await assertRevert(txPromise);
    });

    it("transfer(): transferring to a blacklisted address reverts", async () => {
      await assertRevert(usdhTokenTester.transfer(usdhTokenTester.address, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(ZERO_ADDRESS, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(troveManager.address, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(stabilityPool.address, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(borrowerOperations.address, 1, { from: alice }));
    });

    it("increaseAllowance(): increases an account's allowance by the correct amount", async () => {
      const allowance_A_Before = await usdhTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_Before, "0");

      await usdhTokenTester.increaseAllowance(alice, 100, { from: bob });

      const allowance_A_After = await usdhTokenTester.allowance(bob, alice);
      assert.equal(allowance_A_After, 100);
    });

    if (!withProxy) {
      it("mint(): issues correct amount of tokens to the given address", async () => {
        const alice_balanceBefore = await usdhTokenTester.balanceOf(alice);
        assert.equal(alice_balanceBefore, 150);

        await usdhTokenTester.unprotectedMint(alice, 100);

        const alice_BalanceAfter = await usdhTokenTester.balanceOf(alice);
        assert.equal(alice_BalanceAfter, 250);
      });

      it("burn(): burns correct amount of tokens from the given address", async () => {
        const alice_balanceBefore = await usdhTokenTester.balanceOf(alice);
        assert.equal(alice_balanceBefore, 150);

        await usdhTokenTester.unprotectedBurn(alice, 70);

        const alice_BalanceAfter = await usdhTokenTester.balanceOf(alice);
        assert.equal(alice_BalanceAfter, 80);
      });

      // TODO: Rewrite this test - it should check the actual usdhTokenTester's balance.
      it("sendToPool(): changes balances of Stability pool and user by the correct amounts", async () => {
        const stabilityPool_BalanceBefore = await usdhTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceBefore = await usdhTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceBefore, 0);
        assert.equal(bob_BalanceBefore, 100);

        await usdhTokenTester.unprotectedSendToPool(bob, stabilityPool.address, 75);

        const stabilityPool_BalanceAfter = await usdhTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceAfter = await usdhTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceAfter, 75);
        assert.equal(bob_BalanceAfter, 25);
      });

      it("returnFromPool(): changes balances of Stability pool and user by the correct amounts", async () => {
        /// --- SETUP --- give pool 100 USDH
        await usdhTokenTester.unprotectedMint(stabilityPool.address, 100);

        /// --- TEST ---
        const stabilityPool_BalanceBefore = await usdhTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceBefore = await usdhTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceBefore, 100);
        assert.equal(bob_BalanceBefore, 100);

        await usdhTokenTester.unprotectedReturnFromPool(stabilityPool.address, bob, 75);

        const stabilityPool_BalanceAfter = await usdhTokenTester.balanceOf(stabilityPool.address);
        const bob_BalanceAfter = await usdhTokenTester.balanceOf(bob);
        assert.equal(stabilityPool_BalanceAfter, 25);
        assert.equal(bob_BalanceAfter, 175);
      });
    }

    it("transfer(): transferring to a blacklisted address reverts", async () => {
      await assertRevert(usdhTokenTester.transfer(usdhTokenTester.address, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(ZERO_ADDRESS, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(troveManager.address, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(stabilityPool.address, 1, { from: alice }));
      await assertRevert(usdhTokenTester.transfer(borrowerOperations.address, 1, { from: alice }));
    });

    it("decreaseAllowance(): decreases allowance by the expected amount", async () => {
      await usdhTokenTester.approve(bob, dec(3, 18), { from: alice });
      assert.equal((await usdhTokenTester.allowance(alice, bob)).toString(), dec(3, 18));
      await usdhTokenTester.decreaseAllowance(bob, dec(1, 18), { from: alice });
      assert.equal((await usdhTokenTester.allowance(alice, bob)).toString(), dec(2, 18));
    });

    it("decreaseAllowance(): fails trying to decrease more than previously allowed", async () => {
      await usdhTokenTester.approve(bob, dec(3, 18), { from: alice });
      assert.equal((await usdhTokenTester.allowance(alice, bob)).toString(), dec(3, 18));
      await assertRevert(
        usdhTokenTester.decreaseAllowance(bob, dec(4, 18), { from: alice }),
        "ERC20: decreased allowance below zero"
      );
      assert.equal((await usdhTokenTester.allowance(alice, bob)).toString(), dec(3, 18));
    });

    // EIP2612 tests

    if (!withProxy) {
      it("version(): returns the token contract's version", async () => {
        const version = await usdhTokenTester.version();
        assert.equal(version, "1");
      });

      it("Initializes PERMIT_TYPEHASH correctly", async () => {
        assert.equal(await usdhTokenTester.permitTypeHash(), PERMIT_TYPEHASH);
      });

      it("Initializes DOMAIN_SEPARATOR correctly", async () => {
        assert.equal(
          await usdhTokenTester.domainSeparator(),
          getDomainSeparator(tokenName, usdhTokenTester.address, chainId, tokenVersion)
        );
      });

      it("Initial nonce for a given address is 0", async function () {
        assert.equal(toBN(await usdhTokenTester.nonces(alice)).toString(), "0");
      });

      // Create the approval tx data
      const approve = {
        owner: alice,
        spender: bob,
        value: 1
      };

      const buildPermitTx = async deadline => {
        const nonce = (await usdhTokenTester.nonces(approve.owner)).toString();

        // Get the EIP712 digest
        const digest = getPermitDigest(
          tokenName,
          usdhTokenTester.address,
          chainId,
          tokenVersion,
          approve.owner,
          approve.spender,
          approve.value,
          nonce,
          deadline
        );

        const { v, r, s } = sign(digest, alicePrivateKey);

        const tx = usdhTokenTester.permit(
          approve.owner,
          approve.spender,
          approve.value,
          deadline,
          v,
          hexlify(r),
          hexlify(s)
        );

        return { v, r, s, tx };
      };

      it("permits and emits an Approval event (replay protected)", async () => {
        const deadline = 100000000000000;

        // Approve it
        const { v, r, s, tx } = await buildPermitTx(deadline);
        const receipt = await tx;
        const event = receipt.logs[0];

        // Check that approval was successful
        assert.equal(event.event, "Approval");
        assert.equal(await usdhTokenTester.nonces(approve.owner), 1);
        assert.equal(await usdhTokenTester.allowance(approve.owner, approve.spender), approve.value);

        // Check that we can not use re-use the same signature, since the user's nonce has been incremented (replay protection)
        await assertRevert(
          usdhTokenTester.permit(approve.owner, approve.spender, approve.value, deadline, v, r, s),
          "USDH: invalid signature"
        );

        // Check that the zero address fails
        await assertAssert(
          usdhTokenTester.permit(
            "0x0000000000000000000000000000000000000000",
            approve.spender,
            approve.value,
            deadline,
            "0x99",
            r,
            s
          )
        );
      });

      it("permits(): fails with expired deadline", async () => {
        const deadline = 1;

        const { v, r, s, tx } = await buildPermitTx(deadline);
        await assertRevert(tx, "USDH: expired deadline");
      });

      it("permits(): fails with the wrong signature", async () => {
        const deadline = 100000000000000;

        const { v, r, s } = await buildPermitTx(deadline);

        const tx = usdhTokenTester.permit(
          carol,
          approve.spender,
          approve.value,
          deadline,
          v,
          hexlify(r),
          hexlify(s)
        );

        await assertRevert(tx, "USDH: invalid signature");
      });
    }
  };
  describe("Basic token functions, without Proxy", async () => {
    testCorpus({ withProxy: false });
  });

  describe("Basic token functions, with Proxy", async () => {
    testCorpus({ withProxy: true });
  });
});

contract("Reset chain state", async accounts => {});
