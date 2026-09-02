import { Keypair } from "@solana/web3.js";
import { burn, fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bs58 from "bs58";
import { airdrop, getUmi, load } from "./helper.ts";

const dir = path.dirname(fileURLToPath(import.meta.url));
const assetAddress = publicKey(load("asset.txt"));

// burn has to be signed by the current owner, which is the keypair from nft_transfer
const owner = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(path.join(dir, "new_owner.txt"), "utf8")))
);
const umi = getUmi(owner);

(async () => {
  try {
    await airdrop(owner);
    const asset = await fetchAsset(umi, assetAddress);

    let result = await burn(umi, { asset }).sendAndConfirm(umi);
    console.log("burned:", bs58.encode(result.signature));

    try {
      await fetchAsset(umi, assetAddress);
      console.log("still there?");
    } catch {
      console.log("account closed");
    }
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
