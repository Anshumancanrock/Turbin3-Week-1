import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
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
}

describe("mpl core", () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate();

  it("mint, update, transfer, burn", async () => {
    await fund(payer);
    await fund(recipient);

    let umi = umiFor(payer);
    const asset = generateSigner(umi);

    await create(umi, {
      asset,
      name: "week1",
      uri: "https://example.com/week1.json",
    }).sendAndConfirm(umi);

    let nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.name).toBe("week1");
    expect(nft.owner).toBe(payer.publicKey.toBase58());

    await update(umi, {
      asset: nft,
      name: "week1 v2",
      uri: "https://example.com/week1-v2.json",
    }).sendAndConfirm(umi);

    nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.name).toBe("week1 v2");
    expect(nft.uri).toBe("https://example.com/week1-v2.json");

    await transfer(umi, {
      asset: nft,
      newOwner: recipient.publicKey.toBase58(),
    }).sendAndConfirm(umi);

    nft = await fetchAsset(umi, asset.publicKey);
    expect(nft.owner).toBe(recipient.publicKey.toBase58());

    umi = umiFor(recipient);
    nft = await fetchAsset(umi, asset.publicKey);
    await burn(umi, { asset: nft }).sendAndConfirm(umi);

    await expect(fetchAsset(umi, asset.publicKey)).rejects.toThrow();
  });
});
