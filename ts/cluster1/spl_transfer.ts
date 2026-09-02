import { Keypair, PublicKey } from "@solana/web3.js";
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
  transfer,
} from "@solana/spl-token";
import { airdrop, connection, fail, load, loadWallet, save } from "./helper.js";

const token_decimals = 1_000_000n;

(async () => {
  try {
    const keypair = loadWallet();
    await airdrop(keypair);
    const mint = new PublicKey(load("mint.txt"));
    const to = Keypair.generate();

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

    save("spl_to.txt", JSON.stringify(Array.from(to.secretKey)));

    const fromBal = await getAccount(connection, fromAta.address);
    const toBal = await getAccount(connection, toAta.address);

    console.log("sent to", to.publicKey.toBase58());
    console.log("txid:", sig);
    console.log("my balance:", Number(fromBal.amount) / 1_000_000);
    console.log("their balance:", Number(toBal.amount) / 1_000_000);
  } catch (error) {
    fail(error);
  }
})();
