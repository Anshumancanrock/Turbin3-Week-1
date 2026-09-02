# Week 1

SPL token + mpl core nft.

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

mint 1000 (6 decimals), send 250. dest keypair goes in `spl_to.txt`.

## NFT

```
npm run nft_mint
npm run nft_update
npm run nft_transfer
npm run nft_burn
```

`nft_transfer` also sends a little SOL so the new owner can pay the burn fee.

burn doesnt fully close the account. core leaves a 1-byte tombstone so some lamports stay.

metadata uri is a github commit sha, not `main`, so the json cant change later.

devnet:

```
RPC_URL=https://api.devnet.solana.com npm run spl_init
```

same for the other scripts. need SOL on the wallet.

i ran the whole thing on devnet too:

- mint: [Fc5kSg5peEiCtKigfEhq2Vq85QDQ1xo66LDuEGb83N7P](https://explorer.solana.com/address/Fc5kSg5peEiCtKigfEhq2Vq85QDQ1xo66LDuEGb83N7P?cluster=devnet)
- mint 1000: [tx](https://explorer.solana.com/tx/216zd36NQYizpoihGTs5ypwtckeRPYvMQ5WWbAR1SmZ728SGjQztknPjYs5hczkZCZNdmCPLKJTojSYW7YrmETQ6?cluster=devnet)
- send 250: [tx](https://explorer.solana.com/tx/2FbRZToRGRDrMnEsuxeTfoAtzwVrYfBEyDoDKr1RgL9RQnxqsAjJa1ZrxGg2j4MwgwzgTQxAheQvWsksjrUNaaX1?cluster=devnet)
- nft: [47tMB9fd9h8DyFZXuqRG6sXn133ebTZsa4596ARoMhxA](https://explorer.solana.com/address/47tMB9fd9h8DyFZXuqRG6sXn133ebTZsa4596ARoMhxA?cluster=devnet)
- create: [tx](https://explorer.solana.com/tx/5bRRXhJeqhazZ3XemdddxhGSbWjR3Qjp4S125v1Sg3at77coQREnJELM4PyitzLA4zYEPQ6fvqoJ4obx2Y81TR9e?cluster=devnet)
- update name/uri: [tx](https://explorer.solana.com/tx/BdEkiUoze9ibGBCF4y5vn4YZ8GtrySFoa7JEGYzVfoigGBpzeEnwUsypn4nP2eWcNEWpSf7opTtoXeVCDMySSYQ?cluster=devnet)
- transfer: [tx](https://explorer.solana.com/tx/25a3ByuiesAKtPmywcTZqzwcpPKwFS4xnijxeW7AokBDZSvtgXgNZHndR2RoHA2d4bZmg6BaEUDbR52icZgnQhhL?cluster=devnet)
- burn (account size 1 after): [tx](https://explorer.solana.com/tx/Lcwqp7LAePE5qGJyjkL587YhMFTvevUZxzMavNNQCWEV8rZtoJKArAAKnd7rAyi7agpEeEDfHeBawAQfygefrVh?cluster=devnet)

## Tests

needs `solana-test-validator`. first `npm test` dumps mpl core to `programs/mpl_core.so`. tests use a temp wallet, they wont overwrite `ts/cluster1/wallet.json`.

```
npm test
npx tsc --noEmit
```

![npm test](screenshot.png)
