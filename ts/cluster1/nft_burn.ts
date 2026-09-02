import { Keypair, PublicKey } from "@solana/web3.js";
import { burn, fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { airdrop, connection, fail, getUmi, load } from "./helper.js";

(async () => {
  try {
    const assetAddress = publicKey(load("asset.txt"));
    const owner = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(load("new_owner.txt")))
    );
    const umi = getUmi(owner);

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
