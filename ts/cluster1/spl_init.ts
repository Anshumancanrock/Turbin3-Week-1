import { createMint } from "@solana/spl-token";
import { airdrop, connection, fail, loadWallet, save } from "./helper.js";

(async () => {
  try {
    const keypair = loadWallet();
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
    fail(error);
  }
})();
