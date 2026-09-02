# Week 1

SPL token + MPL Core NFT.

```
cp ~/.config/solana/id.json ts/cluster1/wallet.json
npm i
```

## SPL

```
npm run spl_init
npm run spl_mint
npm run spl_transfer
```

1000 tokens (6 decimals), then 250 to another wallet. Recipient key is saved to `spl_to.txt`.

## NFT (MPL Core)

```
npm run nft_mint
npm run nft_update
npm run nft_transfer
npm run nft_burn
```

`nft_transfer` sends a bit of SOL with the NFT so the new owner can pay for burn (needed on **devnet** — local airdrop doesn't run there).

Burn does not close the account fully. Core leaves a 1-byte tombstone and keeps some lamports. That's the program, not the script.

Devnet:

```
RPC_URL=https://api.devnet.solana.com npm run spl_init
```

same prefix for the rest. Wallet needs SOL.

## Tests

Needs `solana-test-validator`. First run dumps mpl core into `programs/mpl_core.so`.

```
npm test
npx tsc --noEmit
```

![npm test](screenshot.png)
