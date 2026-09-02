import { spawn, execFileSync, type ChildProcess } from "child_process";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const so = path.join(root, "programs", "mpl_core.so");
const ledger = path.join(root, "test-ledger");
const CORE = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function portOpen(port: number) {
  return new Promise<boolean>((resolve) => {
    const sock = net.connect({ port, host: "127.0.0.1" });
    sock.once("connect", () => {
      sock.end();
      resolve(true);
    });
    sock.once("error", () => resolve(false));
  });
}

function freePort(port: number) {
  try {
    execFileSync("fuser", ["-k", `${port}/tcp`], { stdio: "ignore" });
  } catch {
    // nothing listening
  }
}

async function dumpCore() {
  if (fs.existsSync(so) && fs.statSync(so).size > 1000) return;
  fs.mkdirSync(path.dirname(so), { recursive: true });
  console.log("dumping mpl core (this takes a minute the first time)");

  await new Promise<void>((resolve, reject) => {
    const p = spawn(
      "solana",
      ["program", "dump", CORE, so, "--url", "https://api.mainnet-beta.solana.com"],
      { stdio: "inherit" }
    );
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("dump failed"))));
  });
}

export default async function setup() {
  await dumpCore();

  // leftover validator from a killed npm test holds 8899/8900
  freePort(8899);
  freePort(8900);
  await sleep(500);

  fs.rmSync(ledger, { recursive: true, force: true });

  const validator: ChildProcess = spawn(
    "solana-test-validator",
    ["--reset", "--ledger", ledger, "--bpf-program", CORE, so, "--quiet"],
    { cwd: root, stdio: "inherit", detached: true }
  );
  validator.unref();

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const start = Date.now();
  let ready = false;
  while (Date.now() - start < 90_000) {
    try {
      await connection.getLatestBlockhash();
      if (await portOpen(8900)) {
        ready = true;
        break;
      }
    } catch {
      // still booting
    }
    await sleep(400);
  }
  if (!ready) throw new Error("validator did not come up");

  const kp = Keypair.generate();
  const sig = await connection.requestAirdrop(kp.publicKey, LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");

  return async () => {
    if (validator.pid) {
      try {
        process.kill(-validator.pid, "SIGTERM");
      } catch {
        validator.kill("SIGTERM");
      }
    }
  };
}
