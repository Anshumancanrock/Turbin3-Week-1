import { createMint } from "@solana/spl-token";
import { airdrop, connection, loadWallet, save } from "./helper.ts";

const keypair = loadWallet();

(async () => {
  try {
    await airdrop(keypair);

    // 6 decimals like usdc
    const mint = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      6
    );

    console.log(`Your mint address: ${mint.toBase58()}`);
    save("mint.txt", mint.toBase58());
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
