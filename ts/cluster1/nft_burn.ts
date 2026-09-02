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

    // core doesn't fully close the account — it leaves a 1-byte tombstone
    const info = await connection.getAccountInfo(new PublicKey(assetAddress));
    console.log("tombstone bytes:", info?.data.length, "lamports left:", info?.lamports);
  } catch (error) {
    fail(error);
  }
})();
