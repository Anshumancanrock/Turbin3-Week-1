import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { airdrop, connection, fail, load, loadWallet } from "./helper.js";

const token_decimals = 1_000_000n;

(async () => {
  try {
    const keypair = loadWallet();
    await airdrop(keypair);
    const mint = new PublicKey(load("mint.txt"));

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
    fail(error);
  }
})();
