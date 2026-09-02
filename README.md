# Week 1

SPL token + MPL Core NFT. Ran this against local validator (`npm test`) and the scripts in `ts/cluster1`.

Copy your keypair before running the scripts:

```
cp ~/.config/solana/id.json ts/cluster1/wallet.json
```

```
npm i
```

## SPL

```
npm run spl_init
npm run spl_mint
npm run spl_transfer
```

`spl_init` writes the mint to `ts/cluster1/mint.txt` so you don't have to paste it. I mint 1000 (6 decimals) and send 250 to a throwaway keypair.

## NFT (MPL Core)

```
npm run nft_mint
npm run nft_update
npm run nft_transfer
npm run nft_burn
```

Minted as `week1`, then updated the name/uri. Transfer + burn are the extra tasks. Burn is signed by the new owner (so `nft_transfer` airdrops them on localnet first, otherwise the burn tx has no SOL).

For **devnet**:

```
RPC_URL=https://api.devnet.solana.com npm run spl_init
```

same for the other scripts. Wallet needs SOL.

## Tests

Needs `solana-test-validator`. First run dumps the core program into `programs/mpl_core.so`.

```
npm test
```
