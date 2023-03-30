const getContractState = async (exchangeAddress) => {
  const exchange = await hre.ethers.getContractAt("Exchange", exchangeAddress);

  const ethBalance = await hre.ethers.provider.getBalance(exchangeAddress);
  const offers = await exchange.getOffers();

  console.log("ETH balance: ", hre.ethers.utils.formatEther(ethBalance), "ETH");
  console.log("Offers count: ", offers.length);
};

module.exports = {
  getContractState,
};
