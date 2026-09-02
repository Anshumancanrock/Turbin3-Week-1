import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";

const dir = path.dirname(fileURLToPath(import.meta.url));

// local validator by default. for devnet:
// RPC_URL=https://api.devnet.solana.com npm run spl_init
export const RPC = process.env.RPC_URL || "http://127.0.0.1:8899";
export const connection = new Connection(RPC, "confirmed");

export function loadWallet() {
  const walletPath = path.join(dir, "wallet.json");
  if (!fs.existsSync(walletPath)) {
    throw new Error("missing ts/cluster1/wallet.json — copy your id.json there");
  }
  const secret = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

export function getUmi(kp: Keypair) {
  const umi = createUmi(RPC, "confirmed").use(mplCore());
  const umiKp = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);
  umi.use(keypairIdentity(umiKp));
  return umi;
}

export async function airdrop(kp: Keypair) {
  if (!RPC.includes("127.0.0.1") && !RPC.includes("localhost")) return;

  const bal = await connection.getBalance(kp.publicKey);
  if (bal > LAMPORTS_PER_SOL) return;

  const sig = await connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");

  // wait until it actually shows up, faucet is annoying
  for (let i = 0; i < 40; i++) {
    const b = await connection.getBalance(kp.publicKey);
    if (b > LAMPORTS_PER_SOL) return;
    await new Promise((r) => setTimeout(r, 250));
  }
}

export function save(name: string, value: string) {
  fs.writeFileSync(path.join(dir, name), value);
}

export function load(name: string) {
  return fs.readFileSync(path.join(dir, name), "utf8").trim();
}
