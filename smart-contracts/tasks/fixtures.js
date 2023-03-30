/**
 * Get the string representation of a token
 */
const stringifyToken = async (token) => {
  const name = await token.name();
  const symbol = await token.symbol();

  return `${name} ${symbol} ${token.address}`;
};

/**
 *
 */
const toBN = (value, decimals) =>
  (BigInt(value) * 10n ** BigInt(decimals)).toLocaleString("fullwide", {
    useGrouping: false,
  });

/**
 * Deploy several tokens to be able to test the exchange.
 */
const deployTokens = async () => {
  const tokenParams = [
    { name: "Token1", symbol: "TK1" },
    { name: "Token2", symbol: "TK2" },
    { name: "Token3", symbol: "TK3" },
    { name: "Token4", symbol: "TK4" },
    { name: "Token5", symbol: "TK5" },
  ];
  const tokens = [];

  // deploy token contracts
  const PresetToken = await hre.ethers.getContractFactory("PresetToken");
  for (const tokenParam of tokenParams) {
    const token = await PresetToken.deploy(tokenParam.name, tokenParam.symbol);
    await token.deployed();

    tokens.push(token);
  }

  console.log("-- TOKENS");
  console.log("-----------------------------------------");
  for (const token of tokens) {
    const desc = await stringifyToken(token);
    console.log("   ", desc);
  }
  console.log("");

  // airdrop tokens to users to be able to test the exchange
  const accounts = await hre.ethers.getSigners();
  console.log("-- ACCOUNTS");
  console.log("-----------------------------------------");
  for (const account of accounts) {
    console.log(account.address);
  }
  console.log("");

  const amount = 1000;
  for (const token of tokens) {
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    console.log(
      `tranferring ${amount} ${symbol} to all accounts (decimals: ${decimals})`
    );
    for (const account of accounts) {
      await token.transfer(account.address, toBN(amount, decimals));
    }
  }

  return tokens;
};

const deployOffers = async (exchangeAddress, tokens) => {
  const exchange = await hre.ethers.getContractAt("Exchange", exchangeAddress);

  const defaultOffers = [
    {
      fromToken: tokens[0],
      fromTokenAmount: 100,
      toToken: tokens[1],
      toTokenAmount: 400,
    },
    {
      fromToken: tokens[0],
      fromTokenAmount: 200,
      toToken: tokens[1],
      toTokenAmount: 300,
    },
    {
      fromToken: tokens[1],
      fromTokenAmount: 300,
      toToken: tokens[0],
      toTokenAmount: 200,
    },
    {
      fromToken: tokens[1],
      fromTokenAmount: 400,
      toToken: tokens[0],
      toTokenAmount: 100,
    },
  ];
  for (offer of defaultOffers) {
    const fromDecimals = await offer.fromToken.decimals();
    const toDecimals = await offer.toToken.decimals();

    await offer.fromToken.increaseAllowance(
      exchangeAddress,
      toBN(offer.fromTokenAmount, fromDecimals)
    );

    await exchange.createOffer(
      offer.fromToken.address,
      toBN(offer.fromTokenAmount, fromDecimals),
      offer.toToken.address,
      toBN(offer.toTokenAmount, toDecimals),
      { value: ethers.utils.parseEther("0.001") }
    );

    console.log("offer created !");
  }
};

const deployFixtures = async (exchangeAddress) => {
  const tokens = await deployTokens();
  await deployOffers(exchangeAddress, tokens);
};

module.exports = {
  deployFixtures,
};
