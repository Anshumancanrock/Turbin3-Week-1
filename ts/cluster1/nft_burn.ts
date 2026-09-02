import { Keypair, PublicKey } from "@solana/web3.js";
import { burn, fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bs58 from "bs58";
import { airdrop, connection, fail, getUmi, load } from "./helper.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const assetAddress = publicKey(load("asset.txt"));

// current owner is the keypair nft_transfer wrote
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

    const info = await connection.getAccountInfo(new PublicKey(assetAddress));
    console.log("account size:", info?.data.length, "lamports:", info?.lamports);
  } catch (error) {
    fail(error);
  }
})();
