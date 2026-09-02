import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import {
  burn,
  create,
  fetchAsset,
  mplCore,
  transfer,
  update,
} from "@metaplex-foundation/mpl-core";
import { describe, expect, it } from "vitest";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

const URI = "https://raw.githubusercontent.com/Anshumancanrock/Turbin3-Week-1/main/metadata/week1.json";
const URI_V2 = "https://raw.githubusercontent.com/Anshumancanrock/Turbin3-Week-1/main/metadata/week1-v2.json";

function umiFor(kp: Keypair) {
  const umi = createUmi("http://127.0.0.1:8899", "confirmed").use(mplCore());
  umi.use(keypairIdentity(umi.eddsa.createKeypairFromSecretKey(kp.secretKey)));
  return umi;
}

async function fund(kp: Keypair) {
  const sig = await connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
  for (let i = 0; i < 40; i++) {
    if ((await connection.getBalance(kp.publicKey)) > LAMPORTS_PER_SOL) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("airdrop did not land");
}

describe("mpl core", () => {
  const creator = Keypair.generate();
  const buyer = Keypair.generate();

  it("mint, transfer, then only update authority can rename", async () => {
    await fund(creator);
    await fund(buyer);

    const umi = umiFor(creator);
    const asset = generateSigner(umi);

    await create(umi, {
      asset,
      name: "week1",
      uri: URI,
    }).sendAndConfirm(umi);

    let nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.owner).toBe(creator.publicKey.toBase58());

    await transfer(umi, {
      asset: nft,
      newOwner: publicKey(buyer.publicKey.toBase58()),
    }).sendAndConfirm(umi);

    nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.owner).toBe(buyer.publicKey.toBase58());

    const buyerUmi = umiFor(buyer);
    nft = await fetchAsset(buyerUmi, asset.publicKey);
    await expect(
      update(buyerUmi, { asset: nft, name: "stolen" }).sendAndConfirm(buyerUmi)
    ).rejects.toThrow();

    nft = await fetchAsset(umi, asset.publicKey);
    await update(umi, {
      asset: nft,
      name: "week1 v2",
      uri: URI_V2,
    }).sendAndConfirm(umi);

    nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.name).toBe("week1 v2");
    expect(nft.owner).toBe(buyer.publicKey.toBase58());

    nft = await fetchAsset(buyerUmi, asset.publicKey);
    await burn(buyerUmi, { asset: nft }).sendAndConfirm(buyerUmi);

    const info = await connection.getAccountInfo(new PublicKey(asset.publicKey));
    expect(info).not.toBeNull();
    expect(info!.data.length).toBe(1);
  });
});
