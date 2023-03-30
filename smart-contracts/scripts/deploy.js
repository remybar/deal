const fs = require("fs");
const { network } = require("hardhat");

// tags to detect contract info zone in the front-end file
// containing all deployed contract addresses and corresponding
// chain data (ID and name).
const START_TAG = ":: BEGIN";
const END_TAG = ":: END";

/**
 * Set the first letter of 'word' to upper case.
 * @param word a word.
 */
const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Search the bounds of the section containing chains data, using the START_TAG and END_TAG tags.
 * @param lines the contract file content lines.
 * @returns a tuple with the index of the first line of the first chain data and the
 * index of the last line of the last chain data.
 */
const findChainSectionBounds = (lines) => {
  const [start, end] = lines.reduce(
    (state, current, index) =>
      current.endsWith(START_TAG) && !state[0]
        ? [index, state[1]]
        : current.endsWith(END_TAG) && !state[1]
        ? [state[0], index]
        : state,
    [null, null]
  );
  return [start && start + 1, end];
};

/**
 * Find the start index of the chain data block corresponding to the current
 * chain ID.
 * @param content the contract file content.
 * @param currentChainId the ID of the current chain.
 * @param chainSectionStartIndex the start index of the chain data section.
 * @param chainSectionEndIndex the end index of the chain data section.
 * @returns a tuple with the start index or null and the end index or null.
 */
const findCurrentChainDataIndex = (
  content,
  currentChainId,
  chainSectionStartIndex,
  chainSectionEndIndex
) => {
  let startIndex = null,
    endIndex = null;

  for (let i = chainSectionStartIndex; i < chainSectionEndIndex; i++) {
    if (content[i].trim().startsWith(`${currentChainId}: `)) {
      startIndex = i;
      break;
    }
  }

  if (startIndex) {
    for (let i = startIndex + 1; i < chainSectionEndIndex; i++) {
      if (content[i].trim().startsWith("},")) {
        endIndex = i;
        break;
      }
    }
  }

  return [startIndex, endIndex];
};

/**
 * Read the front-end contract file content and extract some data.
 * @param contractFile the contract file path.
 * @param currentChainId the ID of the current chain.
 * @returns a tuple containing:
 * - the file content
 * - a flag indicating if the current chain is already in the file
 * - the start and the end indexes of the chain data section in the file
 * - the start and the end indexes of the chain data corresponding to the current chain ID.
 */
const readContractFileContent = (contractFile, currentChainId) => {
  const content = fs
    .readFileSync(contractFile, {
      encoding: "utf8",
    })
    .split(/\r?\n/);
  const [chainSectionStartIndex, chainSectionEndIndex] = findChainSectionBounds(
    content
  );
  const [
    currentChainDataStartIndex,
    currentChainDataEndIndex,
  ] = findCurrentChainDataIndex(
    content,
    currentChainId,
    chainSectionStartIndex,
    chainSectionEndIndex
  );

  return [
    content,
    currentChainDataStartIndex !== null,
    chainSectionStartIndex,
    chainSectionEndIndex,
    currentChainDataStartIndex,
    currentChainDataEndIndex,
  ];
};

/**
 * Write a new content for the front-end contract file.
 * @param contractFile the contract file path.
 * @param content the content to write.
 */
const writeContractFileContent = (contractFile, content) => {
  fs.writeFileSync(contractFile, content.join("\n"), {
    encoding: "utf8",
  });
};

/**
 * Add a new chain to the front-end contract file content.
 * @param content the full front-end contract file content.
 * @param fromIndex the index from where the new chain should be added
 *        (basically the end of the chain data section).
 * @param newChainData the new chain data.
 * @returns the updated front-end contract file content.
 */
const addChainData = (content, fromIndex, newChainData) => {
  updatedContent = [...content];
  updatedContent.splice(fromIndex, 0, ...newChainData);
  return updatedContent;
};

/**
 * Update chain data which are already in the front-end contract file content.
 * @param content the full front-end contract file content.
 * @param contractAddress the new contract address for the current chain.
 * @param startIndex the index from where the chain data should be found and modified.
 * @param endIndex the index of the last possible line for the chain data.
 * @returns the updated front-end contract file content.
 */
const updateChainData = (content, contractAddress, startIndex, endIndex) => {
  const updatedContent = [...content];
  for (let i = startIndex; i < endIndex; i++) {
    if (content[i].trim().startsWith(`contract: `)) {
      updatedContent[i] = `    contract: "${contractAddress}",`;
      break;
    }
  }

  return updatedContent;
};

/**
 * Update the front-end contract file with the newly deployed
 * contract address on the current chain.
 * @param contractAddress the contract address.
 */
const updateFrontEnd = async (contractAddress) => {
  const networkName = hre?.network?.name || hre.config.defaultNetwork;
  const chainId =
    hre?.network?.config?.chainId ||
    hre.config.networks[hre.config.defaultNetwork].chainId;
  const tokenExplorerUrl = hre?.network?.config?.tokenExplorerUrl || "";
  const addressExplorerUrl = hre?.network?.config?.addressExplorerUrl || "";

  const contractFile = hre.userConfig.frontEnd.contractFile;
  const newChainData = [
    `  ${chainId}: {`,
    `    chainId: ${chainId},`,
    `    tokenExplorerUrl: '${tokenExplorerUrl}',`,
    `    addressExplorerUrl: '${addressExplorerUrl}',`,
    `    networkName: '${capitalize(networkName)}',`,
    `    contract: '${contractAddress}'`,
    "  },",
  ];

  const [
    content,
    isChainAlreadyExists,
    _,
    chainSectionEndIndex,
    currentChainDataStartIndex,
    currentChainDataEndIndex,
  ] = readContractFileContent(contractFile, chainId);

  const updatedContent = isChainAlreadyExists
    ? updateChainData(
        content,
        contractAddress,
        currentChainDataStartIndex,
        currentChainDataEndIndex
      )
    : addChainData(content, chainSectionEndIndex, newChainData);

  writeContractFileContent(contractFile, updatedContent);
  console.log("Front-end contract file updated !");
};

/**
 * Main.
 */
const main = async () => {
  const makerFee = ethers.utils.parseEther("0.001");
  const takerFee = ethers.utils.parseEther("0.001");
  const Exchange = await hre.ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(makerFee, takerFee);
  await exchange.deployed();

  console.log("contract deployed at: ", exchange.address);

  await updateFrontEnd(exchange.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
