import { Keypair } from "@solana/web3.js";
import { fetchAsset, transfer } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { airdrop, fail, getUmi, load, loadWallet, save, sendSol } from "./helper.js";

(async () => {
  try {
    const keypair = loadWallet();
    const umi = getUmi(keypair);
    await airdrop(keypair);
    const assetAddress = publicKey(load("asset.txt"));

    const to = Keypair.generate();
    await sendSol(keypair, to.publicKey);

    const asset = await fetchAsset(umi, assetAddress);

    let result = await transfer(umi, {
      asset,
      newOwner: publicKey(to.publicKey.toBase58()),
    }).sendAndConfirm(umi);

    save("new_owner.txt", JSON.stringify(Array.from(to.secretKey)));

    console.log("new owner:", to.publicKey.toBase58());
    console.log("txid:", bs58.encode(result.signature));

    const after = await fetchAsset(umi, assetAddress);
    console.log("owner now:", after.owner);
  } catch (error) {
    fail(error);
  }
})();
