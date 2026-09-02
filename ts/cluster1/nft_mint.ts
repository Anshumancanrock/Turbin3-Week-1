import { create, fetchAsset } from "@metaplex-foundation/mpl-core";
import { generateSigner } from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { airdrop, fail, getUmi, loadWallet, save } from "./helper.js";

const keypair = loadWallet();
const umi = getUmi(keypair);

const asset = generateSigner(umi);

const URI =
  "https://raw.githubusercontent.com/Anshumancanrock/Turbin3-Week-1/main/metadata/week1.json";

(async () => {
  try {
    await airdrop(keypair);

    let tx = create(umi, {
      asset,
      name: "week1",
      uri: URI,
    });

    let result = await tx.sendAndConfirm(umi);
    const signature = bs58.encode(result.signature);

    console.log("txid:", signature);
    console.log("Asset:", asset.publicKey);

    save("asset.txt", asset.publicKey.toString());

    const fetched = await fetchAsset(umi, asset.publicKey);
    console.log("name:", fetched.name);
    console.log("owner:", fetched.owner);
  } catch (error) {
    fail(error);
  }
})();
