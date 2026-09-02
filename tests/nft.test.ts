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
  const payer = Keypair.generate();
  const other = Keypair.generate();

  it("cant update after transfer", async () => {
    await fund(payer);
    await fund(other);

    const umi = umiFor(payer);
    const asset = generateSigner(umi);

    await create(umi, {
      asset,
      name: "week1",
      uri: URI,
    }).sendAndConfirm(umi);

    let nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.owner).toBe(payer.publicKey.toBase58());

    await transfer(umi, {
      asset: nft,
      newOwner: publicKey(other.publicKey.toBase58()),
    }).sendAndConfirm(umi);

    nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.owner).toBe(other.publicKey.toBase58());

    const otherUmi = umiFor(other);
    nft = await fetchAsset(otherUmi, asset.publicKey);
    await expect(
      update(otherUmi, { asset: nft, name: "nope" }).sendAndConfirm(otherUmi)
    ).rejects.toThrow();

    nft = await fetchAsset(umi, asset.publicKey);
    await update(umi, {
      asset: nft,
      name: "week1 v2",
      uri: URI_V2,
    }).sendAndConfirm(umi);

    nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.name).toBe("week1 v2");
    expect(nft.owner).toBe(other.publicKey.toBase58());

    nft = await fetchAsset(otherUmi, asset.publicKey);
    await burn(otherUmi, { asset: nft }).sendAndConfirm(otherUmi);

    const info = await connection.getAccountInfo(new PublicKey(asset.publicKey));
    expect(info).not.toBeNull();
    expect(info!.data.length).toBe(1);
  });
});
