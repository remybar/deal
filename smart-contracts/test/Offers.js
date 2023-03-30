const { expect } = require("chai");
const { ethers } = require("hardhat");

let chai = require("chai");
chai.use(require("chai-string"));

function assertOffer(offer, expectedOffer) {
  // ignore offer.id as it is interally set by the smart contract
  expect(offer.owner).equalIgnoreCase(expectedOffer.owner);
  expect(offer.fromToken).equalIgnoreCase(expectedOffer.fromToken);
  expect(offer.fromTokenAmount).equal(expectedOffer.fromTokenAmount);
  expect(offer.toToken).equalIgnoreCase(expectedOffer.toToken);
  expect(offer.toTokenAmount).equal(expectedOffer.toTokenAmount);
}

describe("Offers", function() {
  let offersMockFactory, offersMock;

  // some fake users
  const user1 = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const user2 = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

  // some fake tokens
  const token1 = "0x1111111111111111111111111111111111111111";
  const token2 = "0x2222222222222222222222222222222222222222";

  // some fake offers
  const fakeOffers = [
    {
      id: 1,
      owner: user1,
      fromToken: token1,
      fromTokenAmount: 1,
      toToken: token2,
      toTokenAmount: 2,
      reservedFor: ethers.constants.AddressZero,
    },
    {
      id: 2,
      owner: user2,
      fromToken: token1,
      fromTokenAmount: 3,
      toToken: token2,
      toTokenAmount: 4,
      reservedFor: ethers.constants.AddressZero,
    },
    {
      id: 3,
      owner: user1,
      fromToken: token2,
      fromTokenAmount: 5,
      toToken: token1,
      toTokenAmount: 6,
      reservedFor: "0x2222222222222222222222222222222222222222",
    },
    {
      id: 4,
      owner: user2,
      fromToken: token2,
      fromTokenAmount: 7,
      toToken: token1,
      toTokenAmount: 8,
      reservedFor: ethers.constants.AddressZero,
    },
    {
      id: 5,
      owner: user1,
      fromToken: token1,
      fromTokenAmount: 9,
      toToken: token2,
      toTokenAmount: 10,
      reservedFor: ethers.constants.AddressZero,
    },
    {
      id: 6,
      owner: user2,
      fromToken: token1,
      fromTokenAmount: 11,
      toToken: token2,
      toTokenAmount: 12,
      reservedFor: ethers.constants.AddressZero,
    },
  ];
  const [fakeOffer1, fakeOffer2] = fakeOffers;

  before(async () => {
    offersMockFactory = await ethers.getContractFactory("OffersMock");
  });

  beforeEach(async () => {
    offersMock = await offersMockFactory.deploy();
    await offersMock.deployed();
  });

  describe("Adding offers", function() {
    it("Should add the offer when there is no offer yet", async function() {
      await offersMock.add(fakeOffer1);
      const offers = await offersMock.getAll();

      expect(offers).length(1);
      expect(offers[0].id).equal(1);
      assertOffer(offers[0], fakeOffer1);
    });

    it("Should add the offer correctly when there is already an offer in the list", async function() {
      await offersMock.add(fakeOffer1);
      await offersMock.add(fakeOffer2);

      const offers = await offersMock.getAll();

      expect(offers).length(2);
      expect(offers[0].id).equal(1);
      expect(offers[1].id).equal(2);
      assertOffer(offers[0], fakeOffer1);
      assertOffer(offers[1], fakeOffer2);
    });

    it("Should add the offer correctly when another offer has been removed from the list before", async function() {
      await offersMock.add(fakeOffer1);
      await offersMock.remove(1);
      await offersMock.add(fakeOffer2);

      const offers = await offersMock.getAll();

      expect(offers).length(1);
      expect(offers[0].id).equal(2);
      assertOffer(offers[0], fakeOffer2);
    });

    it("Should add several offers correctly", async function() {
      for (const offer of fakeOffers) {
        await offersMock.add(offer);
      }

      const offers = await offersMock.getAll();

      expect(offers.length).equal(fakeOffers.length);

      for (i = 0; i < offers.length; i++) {
        expect(offers[i].id).equal(i + 1);
        assertOffer(offers[i], fakeOffers[i]);
      }
    });
  });

  describe("Removing offers", function() {
    beforeEach(async () => {
      for (const offer of fakeOffers) {
        await offersMock.add(offer);
      }
    });

    it("Should raise an exception for invalid ID", async function() {
      await expect(offersMock.remove(0)).to.be.revertedWith(
        "Remove: Invalid offer ID"
      );
    });

    it("Should do nothing when removing an unexisting offer ID", async function() {
      await offersMock.remove(45);

      const offers = await offersMock.getAll();
      expect(offers.length).equals(fakeOffers.length);
    });

    it("Should remove the offer matching the ID (first offer)", async function() {
      const removeId = fakeOffers[0].id;

      await offersMock.remove(removeId);

      const offers = await offersMock.getAll();

      const currentOffers = [...offers].sort((a, b) => a[0] - b[0]);
      const expectedOffers = fakeOffers.filter((o) => o.id !== removeId);

      expect(currentOffers.length).equals(expectedOffers.length);

      for (let i = 0; i < currentOffers.length; i++) {
        assertOffer(currentOffers[i], expectedOffers[i]);
      }
    });

    it("Should remove the offer matching the ID (middle offer)", async function() {
      const removeId = fakeOffers[3].id;

      await offersMock.remove(removeId);

      const offers = await offersMock.getAll();

      const currentOffers = [...offers].sort((a, b) => a[0] - b[0]);
      const expectedOffers = fakeOffers.filter((o) => o.id !== removeId);

      expect(currentOffers.length).equals(expectedOffers.length);

      for (let i = 0; i < currentOffers.length; i++) {
        assertOffer(currentOffers[i], expectedOffers[i]);
      }
    });

    it("Should remove the offer matching the ID (last offer)", async function() {
      const removeId = fakeOffers[fakeOffers.length - 1].id;

      await offersMock.remove(removeId);

      const offers = await offersMock.getAll();

      const currentOffers = [...offers].sort((a, b) => a[0] - b[0]);
      const expectedOffers = fakeOffers.filter((o) => o.id !== removeId);

      expect(currentOffers.length).equals(expectedOffers.length);

      for (let i = 0; i < currentOffers.length; i++) {
        assertOffer(currentOffers[i], expectedOffers[i]);
      }
    });
  });

  describe("Containing offers", function() {
    beforeEach(async () => {
      for (const offer of fakeOffers) {
        await offersMock.add(offer);
      }
    });

    it("Should contain an offer previously added in the list", async function() {
      for (let i = 1; i <= fakeOffers.length; i++) {
        const result = await offersMock.contains(i);
        expect(result).to.be.true;
      }

      const result = await offersMock.contains(fakeOffers.length + 1);
      expect(result).to.be.false;
    });

    it("Should not contain an offer previously removed from the list", async function() {
      const removedOfferId = 2;

      await offersMock.remove(removedOfferId);

      for (let i = 1; i <= fakeOffers.length; i++) {
        const result = await offersMock.contains(i);
        expect(result).to.be.equal(i !== removedOfferId);
      }
    });
  });

  describe("Editing offers", function() {
    beforeEach(async () => {
      for (const offer of fakeOffers) {
        await offersMock.add(offer);
      }
    });

    it("Should not edit an offer with a bad ID", async function() {
      await expect(
        offersMock.set({ ...fakeOffers[0], id: 0 })
      ).to.be.revertedWith("Set: Invalid offer ID");
    });

    it("Should not edit an offer if not in the list", async function() {
      await expect(
        offersMock.set({ ...fakeOffers[0], id: 45 })
      ).to.be.revertedWith("Set: Unexisting offer ID");
    });

    it("Should edit an offer with a valid ID", async function() {
      const updatedOffer = {
        id: 1,
        owner: user2,
        fromToken: token2,
        fromTokenAmount: 3,
        toToken: token2,
        toTokenAmount: 4,
        reservedFor: ethers.constants.AddressZero,
      };

      await offersMock.set(updatedOffer);

      const offer = await offersMock.get(updatedOffer.id);
      assertOffer(offer, updatedOffer);
    });
  });

  describe("Getting offers", function() {
    beforeEach(async () => {
      for (const offer of fakeOffers) {
        await offersMock.add(offer);
      }
    });

    it("Should not get an offer with a bad ID", async function() {
      await expect(offersMock.get(0)).to.be.revertedWith(
        "Get: Invalid offer ID"
      );
    });

    it("Should not get an offer if not in the list", async function() {
      await expect(offersMock.get(45)).to.be.revertedWith(
        "Get: Unexisting offer ID"
      );
    });

    it("Should get an offer from the beginning of the list", async function() {
      const expectedId = 1;
      const expectedOffer = fakeOffers[expectedId - 1];

      const offer = await offersMock.get(expectedId);

      expect(offer.id).equal(expectedId);
      assertOffer(offer, expectedOffer);
    });

    it("Should get an offer from the middle of the list", async function() {
      const expectedId = 3;
      const expectedOffer = fakeOffers[expectedId - 1];

      const offer = await offersMock.get(expectedId);

      expect(offer.id).equal(expectedId);
      assertOffer(offer, expectedOffer);
    });

    it("Should get an offer from the end of the list", async function() {
      const expectedId = fakeOffers.length;
      const expectedOffer = fakeOffers[expectedId - 1];

      const offer = await offersMock.get(expectedId);

      expect(offer.id).equal(expectedId);
      assertOffer(offer, expectedOffer);
    });
  });
});
