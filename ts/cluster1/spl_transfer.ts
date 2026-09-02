import { Keypair, PublicKey } from "@solana/web3.js";
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
  transfer,
} from "@solana/spl-token";
import { airdrop, connection, load, loadWallet } from "./helper.ts";

const keypair = loadWallet();
const mint = new PublicKey(load("mint.txt"));
const token_decimals = 1_000_000n;

// random dest so i dont have to ask someone for a pubkey
const to = Keypair.generate();

(async () => {
  try {
    await airdrop(keypair);

    const fromAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    const toAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to.publicKey
    );

    const sig = await transfer(
      connection,
      keypair,
      fromAta.address,
      toAta.address,
      keypair,
      250n * token_decimals
    );

    const fromBal = await getAccount(connection, fromAta.address);
    const toBal = await getAccount(connection, toAta.address);

    console.log("sent to", to.publicKey.toBase58());
    console.log("txid:", sig);
    console.log("my balance:", Number(fromBal.amount) / 1_000_000);
    console.log("their balance:", Number(toBal.amount) / 1_000_000);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
