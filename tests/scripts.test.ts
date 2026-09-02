import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmpWallet = path.join(root, "tests", ".tmp-wallet.json");
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

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

async function run(script: string) {
  return execFileAsync(path.join(root, "node_modules/.bin/tsx"), [path.join("ts/cluster1", script)], {
    cwd: root,
    env: { ...process.env, WALLET_PATH: tmpWallet },
  });
}

describe("cluster1 scripts", () => {
  it("scripts work, update after burn exits 1", async () => {
    const kp = Keypair.generate();
    await fund(kp);
    fs.writeFileSync(tmpWallet, JSON.stringify(Array.from(kp.secretKey)));

    try {
      await run("spl_init.ts");
      await run("spl_mint.ts");
      await run("spl_transfer.ts");
      await run("nft_mint.ts");
      await run("nft_update.ts");
      await run("nft_transfer.ts");
      await run("nft_burn.ts");

      await expect(run("nft_update.ts")).rejects.toMatchObject({ code: 1 });
    } finally {
      fs.rmSync(tmpWallet, { force: true });
    }
  });
});
