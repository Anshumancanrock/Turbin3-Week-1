import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";
import { describe, expect, it } from "vitest";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const decimals = 1_000_000n;

async function fund(kp: Keypair) {
  const sig = await connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
  for (let i = 0; i < 40; i++) {
    if ((await connection.getBalance(kp.publicKey)) > LAMPORTS_PER_SOL) return;
    await new Promise((r) => setTimeout(r, 250));
  }
}

describe("spl", () => {
  const payer = Keypair.generate();
  const other = Keypair.generate();
  let mint: PublicKey;

  it("creates a mint", async () => {
    await fund(payer);
    mint = await createMint(connection, payer, payer.publicKey, null, 6);
    const info = await getMint(connection, mint);
    expect(info.decimals).toBe(6);
  });

  it("mints 1000 and transfers 250", async () => {
    const fromAta = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    await mintTo(
      connection,
      payer,
      mint,
      fromAta.address,
      payer,
      1000n * decimals
    );

    const toAta = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      other.publicKey
    );
    await transfer(
      connection,
      payer,
      fromAta.address,
      toAta.address,
      payer,
      250n * decimals
    );

    const mine = await getAccount(connection, fromAta.address);
    const theirs = await getAccount(connection, toAta.address);
    expect(mine.amount).toBe(750n * decimals);
    expect(theirs.amount).toBe(250n * decimals);
  });
});
