const { ethers } = require("hardhat");
const { expect } = require("chai");
const { BN } = require("@openzeppelin/test-helpers");

function assertOffer(offer, expectedOffer) {
  expect(offer.id).equal(expectedOffer.id);
  expect(offer.owner).equal(expectedOffer.owner);
  expect(offer.fromToken).equal(expectedOffer.fromToken);
  expect(offer.fromTokenAmount).equal(expectedOffer.fromTokenAmount);
  expect(offer.toToken).equal(expectedOffer.toToken);
  expect(offer.toTokenAmount).equal(expectedOffer.toTokenAmount);
}

describe("Exchange", function() {
  const DEFAULT_MAKER_FEE = ethers.utils.parseEther("0.001");
  const DEFAULT_TAKER_FEE = ethers.utils.parseEther("0.002");

  let DEFAULT_FROM_TOKEN;
  const DEFAULT_FROM_AMOUNT = 100;
  let DEFAULT_TO_TOKEN;
  const DEFAULT_TO_AMOUNT = 50;

  const createOfferOptions = { value: DEFAULT_MAKER_FEE };
  const buyOfferOptions = { value: DEFAULT_TAKER_FEE };
  const TOKEN1_USER1_STARTING_BALANCE = 10000;
  const TOKEN1_USER2_STARTING_BALANCE = 20000;
  const TOKEN2_USER1_STARTING_BALANCE = 30000;
  const TOKEN2_USER2_STARTING_BALANCE = 40000;
  let token1, token2;
  let Exchange, exchange, owner, user1, user2;

  const getTxFee = async (tx) => {
    const receipt = await tx.wait();
    return receipt.gasUsed.mul(receipt.effectiveGasPrice);
  };

  before(async () => {
    Exchange = await ethers.getContractFactory("Exchange");
    [owner, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const tokenFactory = await ethers.getContractFactory("PresetToken");

    token1 = await tokenFactory.deploy("Token1", "TK1");
    await token1.deployed();

    token2 = await tokenFactory.deploy("Token2", "TK2");
    await token2.deployed();

    exchange = await Exchange.deploy(DEFAULT_MAKER_FEE, DEFAULT_TAKER_FEE);
    await exchange.deployed();

    await token1.transfer(user1.address, TOKEN1_USER1_STARTING_BALANCE);
    await token1.transfer(user2.address, TOKEN1_USER2_STARTING_BALANCE);
    await token2.transfer(user1.address, TOKEN2_USER1_STARTING_BALANCE);
    await token2.transfer(user2.address, TOKEN2_USER2_STARTING_BALANCE);

    await token1
      .connect(user1)
      .increaseAllowance(exchange.address, TOKEN1_USER1_STARTING_BALANCE);
    await token1
      .connect(user2)
      .increaseAllowance(exchange.address, TOKEN1_USER2_STARTING_BALANCE);
    await token2
      .connect(user1)
      .increaseAllowance(exchange.address, TOKEN2_USER1_STARTING_BALANCE);
    await token2
      .connect(user2)
      .increaseAllowance(exchange.address, TOKEN2_USER2_STARTING_BALANCE);

    DEFAULT_FROM_TOKEN = token1.address;
    DEFAULT_TO_TOKEN = token2.address;
  });

  describe("Initializing", function() {
    it("Should initialize properly all contract data", async function() {
      const offers = await exchange.getOffers();
      expect(offers).lengthOf(0);
    });
  });

  describe("Setting fee", function() {
    it("Should properly set maker fee", async function() {
      const checkCurrentMakerFee = async (value) => {
        const currentMakerFee = await exchange.makerFees();
        expect(currentMakerFee).equals(value);
      };

      checkCurrentMakerFee(DEFAULT_MAKER_FEE);

      const newMakerFee = DEFAULT_MAKER_FEE.mul(2);
      await exchange.setMakerFees(newMakerFee);
      checkCurrentMakerFee(newMakerFee);
    });

    it("Should properly set taker fee", async function() {
      const checkCurrentTakerFee = async (value) => {
        const currentTakerFee = await exchange.takerFees();
        expect(currentTakerFee).equals(value);
      };

      checkCurrentTakerFee(DEFAULT_TAKER_FEE);

      const newTakerFee = DEFAULT_TAKER_FEE.mul(2);
      await exchange.setTakerFees(newTakerFee);
      checkCurrentTakerFee(newTakerFee);
    });
  });

  describe("Withdraw from contract", function() {
    it("Should raise an exception if not the owner of the contract", async function() {
      await expect(exchange.connect(user2).withdraw(1n)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should raise an exception if the requested amount exceeds the ETH balance", async function() {
      await expect(exchange.connect(owner).withdraw(1n)).to.be.revertedWith(
        "Withdraw: exceeds ETH balance"
      );
    });
    it("Should withdraw the request amount from the ETH balance of the contract", async function() {
      const getBalance = async (address) =>
        await owner.provider.getBalance(address);
      const withdrawValue = ethers.utils.parseEther("1.0");

      // be sure that the ETH balance of the contract is not empty ;-)
      await owner.sendTransaction({
        from: owner.address,
        to: exchange.address,
        value: ethers.utils.parseEther("5.0"),
      });
      const ethContractBalance = await getBalance(exchange.address);
      const ethOwnerBalance = await getBalance(owner.address);

      const tx = await exchange.withdraw(withdrawValue);

      const txFee = await getTxFee(tx);
      const newEthContractBalance = await getBalance(exchange.address);
      const newEthOwnerBalance = await getBalance(owner.address);

      expect(newEthContractBalance).equals(
        ethContractBalance.sub(withdrawValue)
      );
      expect(newEthOwnerBalance).equals(
        ethOwnerBalance.sub(txFee).add(withdrawValue)
      );
    });
  });

  describe("Creating offers", function() {
    it("Should NOT create an offer if the vendor has CreateOffer: Not enough ETH", async function() {
      await expect(
        exchange
          .connect(user1)
          .createOffer(token1.address, 100, token2.address, 50)
      ).to.be.revertedWith("CreateOffer: Not enough ETH");
    });

    it("Should NOT create an offer if both tokens are the same", async function() {
      await expect(
        exchange.createOffer(
          token1.address,
          100,
          token1.address,
          50,
          createOfferOptions
        )
      ).to.be.revertedWith("CreateOffer: Same tokens");
    });

    it("Should NOT create an offer if the vendor does not own enough tokens", async function() {
      await expect(
        exchange
          .connect(user1)
          .createOffer(
            token1.address,
            TOKEN1_USER1_STARTING_BALANCE + 1,
            token2.address,
            50,
            createOfferOptions
          )
      ).to.be.revertedWith("CreateOffer: Not enough tokens");
    });

    it("Should NOT create an offer if the vendor has not allowed to move the required amount of tokens", async function() {
      const allowance = await token1
        .connect(user1)
        .allowance(user1.address, exchange.address);
      await token1.connect(user1).decreaseAllowance(exchange.address, 1);

      await expect(
        exchange
          .connect(user1)
          .createOffer(
            token1.address,
            allowance,
            token2.address,
            50,
            createOfferOptions
          )
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should create an offer", async function() {
      const ethBalance = await user1.provider.getBalance(user1.address);
      const balance = await token1.balanceOf(user1.address);
      const depositAmount = 100;
      const expectedAmount = 50;

      const tx = await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          depositAmount,
          token2.address,
          expectedAmount,
          createOfferOptions
        );

      //-- event checking

      expect(tx)
        .to.emit(exchange, "OfferCreated")
        .withArgs(1);

      // token balance checking

      expect(await token1.balanceOf(user1.address)).equals(
        balance - depositAmount
      );

      // ETH balance checking (maker fee)

      const txFee = await getTxFee(tx);
      const newEthBalance = await user1.provider.getBalance(user1.address);
      const fullFee = DEFAULT_MAKER_FEE.add(txFee);

      expect(newEthBalance).equals(ethBalance.sub(fullFee));

      // offer metadata checking

      const offers = await exchange.getOffers();
      assertOffer(offers[0], {
        id: 1,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: depositAmount,
        toToken: token2.address,
        toTokenAmount: expectedAmount,
      });
    });
  });

  describe("Editing offers", function() {
    const createFakeOffer = async () => {
      await exchange
        .connect(user1)
        .createOffer(
          DEFAULT_FROM_TOKEN,
          DEFAULT_FROM_AMOUNT,
          DEFAULT_TO_TOKEN,
          DEFAULT_TO_AMOUNT,
          createOfferOptions
        );
    };

    it("Should raise an exception if the offer id is 0", async function() {
      await expect(
        exchange.editOffer(0, 1, token2.address, 2)
      ).to.be.revertedWith("Get: Invalid offer ID");
    });

    it("Should raise an exception if the offer does not exist", async function() {
      await expect(
        exchange.editOffer(12, 1, token2.address, 2)
      ).to.be.revertedWith("Get: Unexisting offer ID");
    });

    it("Should raise an exception if EditOffer: Not the owner", async function() {
      await createFakeOffer();

      await expect(
        exchange.connect(user2).editOffer(1, 100, token2.address, 50)
      ).to.be.revertedWith("EditOffer: Not the owner");
    });

    it("Should update the offer if ID is valid", async function() {
      await createFakeOffer();

      await exchange
        .connect(user1)
        .editOffer(1, DEFAULT_FROM_AMOUNT, DEFAULT_TO_TOKEN, 100);

      const offer = await exchange.getOffer(1);

      assertOffer(offer, {
        id: 1,
        owner: user1.address,
        fromToken: DEFAULT_FROM_TOKEN,
        fromTokenAmount: DEFAULT_FROM_AMOUNT,
        toToken: DEFAULT_TO_TOKEN,
        toTokenAmount: 100,
      });
    });

    it("Should send back tokens if fromTokenAmount is lower", async function() {
      await createFakeOffer();

      const balance = await token1.balanceOf(user1.address);
      const newAmount = DEFAULT_FROM_AMOUNT - 10;

      await exchange
        .connect(user1)
        .editOffer(1, newAmount, DEFAULT_TO_TOKEN, DEFAULT_TO_AMOUNT);

      const newBalance = await token1.balanceOf(user1.address);
      expect(newBalance).equals(balance.add(DEFAULT_FROM_AMOUNT - newAmount));
    });

    it("Should get more tokens if fromTokenAmount is greater", async function() {
      await createFakeOffer();

      const balance = await token1.balanceOf(user1.address);
      const newAmount = DEFAULT_FROM_AMOUNT + 10;

      await exchange
        .connect(user1)
        .editOffer(1, newAmount, DEFAULT_TO_TOKEN, DEFAULT_TO_AMOUNT);

      const newBalance = await token1.balanceOf(user1.address);
      expect(newBalance).equals(balance.sub(newAmount - DEFAULT_FROM_AMOUNT));
    });
  });

  describe("Cancelling offers", function() {
    it("Should raise an exception if the offer id is 0", async function() {
      await expect(exchange.cancelOffer(0)).to.be.revertedWith(
        "Get: Invalid offer ID"
      );
    });

    it("Should raise an exception if the offer does not exist", async function() {
      await expect(exchange.cancelOffer(12)).to.be.revertedWith(
        "Get: Unexisting offer ID"
      );
    });

    it("Should raise an exception if CancelOffer: CancelOffer: Not the offer owner", async function() {
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          100,
          token2.address,
          50,
          createOfferOptions
        );
      await expect(exchange.connect(user2).cancelOffer(1)).to.be.revertedWith(
        "CancelOffer: Not the offer owner"
      );
    });

    it("Should cancel the offer when there is only one offer in the list", async function() {
      const balance = await token1.balanceOf(user1.address);

      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          100,
          token2.address,
          50,
          createOfferOptions
        );

      await expect(exchange.connect(user1).cancelOffer(1))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(1);

      expect(await token1.balanceOf(user1.address)).equals(balance);
      expect(await exchange.getOffers()).lengthOf(0);
    });

    it("Should cancel the offer when the offer is the first one in the list", async function() {
      const offer1Amount = 10;
      const offer2Amount = 20;
      const offer3Amount = 30;
      const balance = await token1.balanceOf(user1.address);

      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer1Amount,
          token2.address,
          2,
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer2Amount,
          token2.address,
          4,
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer3Amount,
          token2.address,
          6,
          createOfferOptions
        );

      await expect(exchange.connect(user1).cancelOffer(1))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(1);

      const offers = await exchange.getOffers();
      expect(offers).lengthOf(2);

      expect(await token1.balanceOf(user1.address)).equals(
        balance - offer2Amount - offer3Amount
      );
      assertOffer(offers[0], {
        id: 3,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer3Amount,
        toToken: token2.address,
        toTokenAmount: 6,
      });
      assertOffer(offers[1], {
        id: 2,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer2Amount,
        toToken: token2.address,
        toTokenAmount: 4,
      });
    });

    it("Should cancel the offer when the offer is in the middle of the list", async function() {
      const offer1Amount = 10;
      const offer2Amount = 20;
      const offer3Amount = 30;
      const balance = await token1.balanceOf(user1.address);

      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer1Amount,
          token2.address,
          2,
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer2Amount,
          token2.address,
          4,
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer3Amount,
          token2.address,
          6,
          createOfferOptions
        );

      await expect(exchange.connect(user1).cancelOffer(2))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(2);

      const offers = await exchange.getOffers();
      expect(offers).lengthOf(2);

      expect(await token1.balanceOf(user1.address)).equals(
        balance - offer1Amount - offer3Amount
      );
      assertOffer(offers[0], {
        id: 1,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer1Amount,
        toToken: token2.address,
        toTokenAmount: 2,
      });
      assertOffer(offers[1], {
        id: 3,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer3Amount,
        toToken: token2.address,
        toTokenAmount: 6,
      });
    });

    it("Should cancel the offer when the offer is the last one in the list", async function() {
      const offer1Amount = 10;
      const offer2Amount = 20;
      const offer3Amount = 30;
      const balance = await token1.balanceOf(user1.address);

      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer1Amount,
          token2.address,
          2,
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer2Amount,
          token2.address,
          4,
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          offer3Amount,
          token2.address,
          6,
          createOfferOptions
        );

      await expect(exchange.connect(user1).cancelOffer(3))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(3);

      const offers = await exchange.getOffers();
      expect(offers).lengthOf(2);

      expect(await token1.balanceOf(user1.address)).equals(
        balance - offer1Amount - offer2Amount
      );
      assertOffer(offers[0], {
        id: 1,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer1Amount,
        toToken: token2.address,
        toTokenAmount: 2,
      });
      assertOffer(offers[1], {
        id: 2,
        owner: user1.address,
        fromToken: token1.address,
        fromTokenAmount: offer2Amount,
        toToken: token2.address,
        toTokenAmount: 4,
      });
    });

    it("Should get back maker fee when cancelling an offer", async function() {
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          100,
          token2.address,
          50,
          createOfferOptions
        );

      const ethBalance = await user1.provider.getBalance(user1.address);

      const tx = await exchange.connect(user1).cancelOffer(1);
      const txFee = await getTxFee(tx);
      const newEthBalance = await user1.provider.getBalance(user1.address);

      expect(newEthBalance).equals(
        ethBalance.sub(txFee).add(DEFAULT_MAKER_FEE)
      );
    });
  });

  describe("Buying offers", function() {
    it("Should raise an exception if the buyer has BuyOffer: Not enough ETH", async function() {
      await exchange
        .connect(user1)
        .createOffer(token1.address, 1, token2.address, 2, createOfferOptions);
      await expect(exchange.connect(user1).buyOffer(1)).to.be.revertedWith(
        "BuyOffer: Not enough ETH"
      );
    });

    it("Should raise an exception if the offer does not exist", async function() {
      await exchange
        .connect(user1)
        .createOffer(token1.address, 1, token2.address, 2, createOfferOptions);
      await expect(
        exchange.connect(user1).buyOffer(12, buyOfferOptions)
      ).to.be.revertedWith("Get: Unexisting offer ID");
    });

    it("Should raise an exception if the owner try to buy his own offer", async function() {
      await exchange
        .connect(user1)
        .createOffer(token1.address, 1, token2.address, 2, createOfferOptions);
      await expect(
        exchange.connect(user1).buyOffer(1, buyOfferOptions)
      ).to.be.revertedWith("BuyOffer: Owner of the offer");
    });

    it("Should raise an exception if the buyer have BuyOffer: Not enough tokens the offer", async function() {
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          1,
          token2.address,
          TOKEN2_USER2_STARTING_BALANCE + 1,
          createOfferOptions
        );
      await expect(
        exchange.connect(user2).buyOffer(1, buyOfferOptions)
      ).to.be.revertedWith("BuyOffer: Not enough tokens");
    });

    it("Should raise an exception if the buyer has not allowed to move the required amount of tokens", async function() {
      const allowance = await token2
        .connect(user2)
        .allowance(user2.address, exchange.address);
      await token2.connect(user2).decreaseAllowance(exchange.address, 1);

      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          1,
          token2.address,
          allowance,
          createOfferOptions
        );
      await expect(
        exchange.connect(user2).buyOffer(1, buyOfferOptions)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should buy the offer", async function() {
      const user1Token1balance = await token1.balanceOf(user1.address);
      const user1Token2balance = await token2.balanceOf(user1.address);
      const user2Token1balance = await token1.balanceOf(user2.address);
      const user2Token2balance = await token2.balanceOf(user2.address);
      const fromAmount = 100;
      const toAmount = 200;

      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          fromAmount,
          token2.address,
          toAmount,
          createOfferOptions
        );

      const ethBalance = await user2.provider.getBalance(user2.address);

      const tx = await exchange.connect(user2).buyOffer(1, buyOfferOptions);

      // -- event checking

      await expect(tx)
        .to.emit(exchange, "OfferRemoved")
        .withArgs(1);

      // -- taker fee checking
      const txFee = await getTxFee(tx);
      const newEthBalance = await user1.provider.getBalance(user2.address);
      const fullFee = DEFAULT_TAKER_FEE.add(txFee);

      expect(newEthBalance).equals(ethBalance.sub(fullFee));

      // -- token balances checking

      expect(await token1.balanceOf(user1.address)).equal(
        user1Token1balance.sub(fromAmount)
      );
      expect(await token1.balanceOf(user2.address)).equal(
        user2Token1balance.add(fromAmount)
      );
      expect(await token2.balanceOf(user1.address)).equal(
        user1Token2balance.add(toAmount)
      );
      expect(await token2.balanceOf(user2.address)).equal(
        user2Token2balance.sub(toAmount)
      );
      expect(await exchange.getOffers()).lengthOf(0);
    });

    it("Should buy all the offers", async function() {
      const fromAmount = [100, 200, 300, 400];
      const toAmount = [400, 300, 200, 100];

      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          fromAmount[0],
          token2.address,
          toAmount[0],
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token1.address,
          fromAmount[1],
          token2.address,
          toAmount[1],
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token2.address,
          fromAmount[2],
          token1.address,
          toAmount[2],
          createOfferOptions
        );
      await exchange
        .connect(user1)
        .createOffer(
          token2.address,
          fromAmount[3],
          token1.address,
          toAmount[3],
          createOfferOptions
        );

      await expect(exchange.connect(user2).buyOffer(2, buyOfferOptions))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(2);
      await expect(exchange.connect(user2).buyOffer(4, buyOfferOptions))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(4);
      await expect(exchange.connect(user2).buyOffer(1, buyOfferOptions))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(1);
      await expect(exchange.connect(user2).buyOffer(3, buyOfferOptions))
        .to.emit(exchange, "OfferRemoved")
        .withArgs(3);

      expect(await exchange.getOffers()).lengthOf(0);
    });
  });
});
