//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./libraries/Offers.sol";

import "hardhat/console.sol";

/**
 * Contract for managing peer-to-peer token sells.
 * An user can create an offer to sell an amount of token A against an amount of tokens B.
 * Another user can accept this offer and provide the required amount of tokens B against
 * the amount of token A.
 * Both buyer and seller have to pay a small fee.
 */
contract Exchange is Ownable {
    using Offers for Offers.OfferSet;
    using Offers for Offers.Offer;

    Offers.OfferSet private _offers;

    uint256 public takerFees;
    uint256 public makerFees;

    event LogDepositReceived(address addr);

    event OfferCreated(uint32 _offerId);
    event OfferRemoved(uint32 _offerId);

    constructor(uint256 _makerFees, uint256 _takerFees) {
        makerFees = _makerFees;
        takerFees = _takerFees;
    }

    fallback() external payable {
    }

    receive() external payable {
        emit LogDepositReceived(msg.sender);
    }

    /**
     * Withdraw ETH balance of the contract to the contract owner
     */
    function withdraw(uint256 _amount) public onlyOwner {
        require(_amount <= address(this).balance, "Withdraw: exceeds ETH balance");
        payable(owner()).transfer(_amount);
    }

    /**
     * Set maker fees in ether.
     * @param _newMakerFees the new maker fees.
     */
    function setMakerFees(uint256 _newMakerFees) public onlyOwner {
        makerFees = _newMakerFees;
    }

    /**
     * Set taker fees in ether.
     * @param _newTakerFees the new taker fees.
     */
    function setTakerFees(uint256 _newTakerFees) public onlyOwner {
        takerFees = _newTakerFees;
    }

    /**
     * @dev Get the list of available offers.
     */
    function getOffers() public view returns (Offers.Offer[] memory) {
        return _offers.getAll();
    }

    /**
     * @dev Get an offer from its id.
     */
    function getOffer(uint32 id) public view returns(Offers.Offer memory) {
        require(_offers.contains(id), "GetOffer: unknown offer ID");
        return _offers.get(id);
    }

    /**
     * 
     */
    function editOffer(
        uint32 id,
        uint256 fromTokenAmount,
        address toTokenAddress,
        uint256 toTokenAmount
    ) public {
        editReservedOffer(id, fromTokenAmount, toTokenAddress, toTokenAmount, address(0));
    }

    /**
     * 
     */
    function editReservedOffer(
        uint32 id,
        uint256 fromTokenAmount,
        address toTokenAddress,
        uint256 toTokenAmount,
        address reservedFor
    ) public {
        Offers.Offer memory offer = _offers.get(id);

        require(offer.owner == msg.sender, "EditOffer: Not the owner");

        IERC20 token = IERC20(offer.fromToken);

        if (fromTokenAmount < offer.fromTokenAmount) {
            uint256 amountBack = offer.fromTokenAmount - fromTokenAmount;
            token.approve(address(this), amountBack);
            token.transferFrom(address(this), offer.owner, amountBack);
        }

         if (fromTokenAmount > offer.fromTokenAmount) {
            uint256 additionalAmount = fromTokenAmount - offer.fromTokenAmount;
            token.transferFrom(offer.owner, address(this), additionalAmount);
        }

        _offers.set(Offers.Offer({
            id: offer.id,
            owner: offer.owner,
            fromToken: offer.fromToken,
            fromTokenAmount: fromTokenAmount,
            toToken: toTokenAddress,
            toTokenAmount: toTokenAmount,
            reservedFor: reservedFor
        }));
    }    

    /**
     * 
     */
    function createOffer(
        address fromTokenAddress,
        uint256 fromTokenAmount,
        address toTokenAddress,
        uint256 toTokenAmount
    ) public payable {
        createReservedOffer(fromTokenAddress, fromTokenAmount, toTokenAddress, toTokenAmount, address(0));
    }

    /**
     * @dev create a new offer.
     * Note: a maker fee is paid at offer creation but it is given back in case of offer cancelling.
     */
    function createReservedOffer(
        address fromTokenAddress,
        uint256 fromTokenAmount,
        address toTokenAddress,
        uint256 toTokenAmount,
        address reservedFor
    ) public payable {
        require(msg.value >= makerFees, "CreateOffer: Not enough ETH");
        require(fromTokenAddress != toTokenAddress, "CreateOffer: Same tokens");
 
        IERC20 token = IERC20(fromTokenAddress);
        require(token.balanceOf(msg.sender) >= fromTokenAmount, "CreateOffer: Not enough tokens");
        require(token.transferFrom(msg.sender, address(this), fromTokenAmount), "CreateOffer: transfer error");

        uint32 id = _offers.add(Offers.Offer({
            id: 0,  // will be set internally by the library and return by the `add` function.
            owner: msg.sender,
            fromToken: fromTokenAddress,
            fromTokenAmount: fromTokenAmount,
            toToken: toTokenAddress,
            toTokenAmount: toTokenAmount,
            reservedFor: reservedFor
        }));
        emit OfferCreated(id);
    }

    /**
     * @dev Cancel an offer with its id.
     */
    function cancelOffer(uint32 id) public {
        Offers.Offer memory offer = _offers.get(id);
        require(offer.owner == msg.sender, "CancelOffer: Not the offer owner");

        IERC20 token = IERC20(offer.fromToken);
        token.transfer(offer.owner, offer.fromTokenAmount);

        payable(offer.owner).transfer(makerFees);

        _offers.remove(id);
        emit OfferRemoved(id);
    }

    /**
     * Buy an offer.
     */
    function buyOffer(uint32 id) public payable {
        require(msg.value >= takerFees, "BuyOffer: Not enough ETH");

        Offers.Offer memory offer = _offers.get(id);
        require(offer.owner != msg.sender, "BuyOffer: Owner of the offer");
        
        IERC20 toToken = IERC20(offer.toToken);
        IERC20 fromToken = IERC20(offer.fromToken);
        require(toToken.balanceOf(msg.sender) >= offer.toTokenAmount, "BuyOffer: Not enough tokens");
        require(toToken.transferFrom(msg.sender, offer.owner, offer.toTokenAmount), "BuyOffer: transferFrom error");
        require(fromToken.transfer(msg.sender, offer.fromTokenAmount), "BuyOffer: transfer error");

        _offers.remove(id);
        emit OfferRemoved(id);
    }
}
