import { fetchAsset, update } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { airdrop, fail, getUmi, load, loadWallet } from "./helper.js";

const keypair = loadWallet();
const umi = getUmi(keypair);
const assetAddress = publicKey(load("asset.txt"));

const URI =
  "https://raw.githubusercontent.com/Anshumancanrock/Turbin3-Week-1/main/metadata/week1-v2.json";

(async () => {
  try {
    await airdrop(keypair);

    // have to fetch first, passing just the address was failing
    const asset = await fetchAsset(umi, assetAddress);

    let result = await update(umi, {
      asset,
      name: "week1 v2",
      uri: URI,
    }).sendAndConfirm(umi);

    console.log("txid:", bs58.encode(result.signature));

    const updated = await fetchAsset(umi, assetAddress);
    console.log("name:", updated.name);
    console.log("uri:", updated.uri);
  } catch (error) {
    fail(error);
  }
})();
