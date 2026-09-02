import { Keypair } from "@solana/web3.js";
import { fetchAsset, transfer } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { airdrop, getUmi, load, loadWallet, save } from "./helper.ts";

const keypair = loadWallet();
const umi = getUmi(keypair);
const assetAddress = publicKey(load("asset.txt"));

(async () => {
  try {
    await airdrop(keypair);

    // need this keypair funded — they pay the burn tx later
    const to = Keypair.generate();
    await airdrop(to);
    save("new_owner.txt", JSON.stringify(Array.from(to.secretKey)));

    const asset = await fetchAsset(umi, assetAddress);

    let result = await transfer(umi, {
      asset,
      newOwner: to.publicKey.toBase58(),
    }).sendAndConfirm(umi);

    console.log("new owner:", to.publicKey.toBase58());
    console.log("txid:", bs58.encode(result.signature));

    const after = await fetchAsset(umi, assetAddress);
    console.log("owner now:", after.owner);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
