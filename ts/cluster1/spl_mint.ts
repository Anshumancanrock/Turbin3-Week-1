import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { airdrop, connection, load, loadWallet } from "./helper.ts";

const keypair = loadWallet();

// paste from spl_init if mint.txt is missing
const mint = new PublicKey(load("mint.txt"));
const token_decimals = 1_000_000n;

(async () => {
  try {
    await airdrop(keypair);

    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    console.log(`Your ata is: ${ata.address.toBase58()}`);

    // 1000 tokens
    const mintTx = await mintTo(
      connection,
      keypair,
      mint,
      ata.address,
      keypair,
      1000n * token_decimals
    );
    console.log(`Your mint txid: ${mintTx}`);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
