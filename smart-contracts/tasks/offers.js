const getOffers = async (exchangeAddress) => {
  const exchange = await hre.ethers.getContractAt("Exchange", exchangeAddress);
  const offers = await exchange.getOffers();
  console.log(offers);
};

module.exports = {
  getOffers,
};
