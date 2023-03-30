# Deal

_Note: this is a personal project mainly developed to practice web3 development with Solidity and NextJS/etherJS._

Deal is a kind of marketplace, allowing users to sell their tokens, even if they are not listed on any DEX/CEX.

An user creates an offer by entering:

- the amount and the address of the token he wants to sell,
- the amount and the address of the token he wants to receive.

_Note that he also has the possibility to create an offer reserved to a specific user by providing his wallet address._

An user buys an offer by providing the required amount of tokens.

Both the seller and the buyer pays a small maker/taker fee in gas token.

You will find more details in the README file dedicated to each section:

- [README](smart-contracts/README.md) for the smart-contracts.
- [README](front-end/README.md) of the front-end.
