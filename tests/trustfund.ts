import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Trustfund } from "../target/types/trustfund";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("trustfund", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Trustfund as Program<Trustfund>;

  let mint: anchor.web3.PublicKey;
  const client = anchor.web3.Keypair.generate();
  const freelancer = anchor.web3.Keypair.generate();
  let clientTokenAccount: anchor.web3.PublicKey;
  let freelancerTokenAccount: anchor.web3.PublicKey;

  const projectId = "proj-1";
  const milestoneId = 1;
  const milestoneAmount = new anchor.BN(100);

  let projectPDA: anchor.web3.PublicKey;
  let vaultTokenAccountPDA: anchor.web3.PublicKey;
  let vaultAuthorityPDA: anchor.web3.PublicKey;
  let milestonePDA: anchor.web3.PublicKey;

  before(async () => {
    // Airdrop SOL
    const sig1 = await provider.connection.requestAirdrop(client.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    const sig2 = await provider.connection.requestAirdrop(freelancer.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);

    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: sig1
    });
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: sig2
    });

    mint = await createMint(
      provider.connection,
      client,
      client.publicKey,
      null,
      6
    );

    clientTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      client,
      mint,
      client.publicKey
    );

    await mintTo(
      provider.connection,
      client,
      mint,
      clientTokenAccount,
      client,
      1000
    );

    freelancerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      client,
      mint,
      freelancer.publicKey
    );

    [projectPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project"), client.publicKey.toBuffer()],
      program.programId
    );

    [vaultTokenAccountPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_token"), projectPDA.toBuffer()],
      program.programId
    );

    [vaultAuthorityPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_auth"), projectPDA.toBuffer()],
      program.programId
    );

    [milestonePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("milestone"), projectPDA.toBuffer(), Buffer.from([milestoneId])],
      program.programId
    );
  });

  it("Initializes Project", async () => {
    await program.methods
      .initializeProject(projectId)
      .accounts({
        project: projectPDA,
        vaultTokenAccount: vaultTokenAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        mint: mint,
        client: client.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([client])
      .rpc();

    const account = await program.account.project.fetch(projectPDA);
    assert.ok(account.client.equals(client.publicKey));
    assert.strictEqual(account.projectId, projectId);
    assert.deepEqual(account.status, { created: {} });
  });

  it("Adds Milestone", async () => {
    await program.methods
      .addMilestone(milestoneId, milestoneAmount)
      .accounts({
        milestone: milestonePDA,
        project: projectPDA,
        clientTokenAccount: clientTokenAccount,
        vaultTokenAccount: vaultTokenAccountPDA,
        client: client.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([client])
      .rpc();

    const account = await program.account.milestone.fetch(milestonePDA);
    assert.ok(account.project.equals(projectPDA));
    assert.ok(account.amount.eq(milestoneAmount));
    assert.deepEqual(account.status, { pending: {} });

    const vaultBal = await provider.connection.getTokenAccountBalance(vaultTokenAccountPDA);
    assert.strictEqual(vaultBal.value.uiAmount, 100 / 10 ** 6);
  });

  it("Accepts Project", async () => {
    await program.methods
      .acceptProject()
      .accounts({
        project: projectPDA,
        freelancer: freelancer.publicKey,
      })
      .signers([freelancer])
      .rpc();

    const account = await program.account.project.fetch(projectPDA);
    assert.ok(account.freelancer.equals(freelancer.publicKey));
    assert.deepEqual(account.status, { accepted: {} });
  });

  it("Releases Funds", async () => {
    await program.methods
      .releaseFunds()
      .accounts({
        project: projectPDA,
        milestone: milestonePDA,
        vaultTokenAccount: vaultTokenAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        freelancerTokenAccount: freelancerTokenAccount,
        freelancer: freelancer.publicKey,
        client: client.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([client])
      .rpc();

    const account = await program.account.milestone.fetch(milestonePDA);
    assert.deepEqual(account.status, { released: {} });

    const freelancerBal = await provider.connection.getTokenAccountBalance(freelancerTokenAccount);
    assert.strictEqual(freelancerBal.value.uiAmount, 100 / 10 ** 6);
  });

  it("Fails unauthorized release", async () => {
    try {
      await program.methods
        .releaseFunds()
        .accounts({
          project: projectPDA,
          milestone: milestonePDA,
          vaultTokenAccount: vaultTokenAccountPDA,
          vaultAuthority: vaultAuthorityPDA,
          freelancerTokenAccount: freelancerTokenAccount,
          freelancer: freelancer.publicKey,
          client: freelancer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([freelancer])
        .rpc();
      assert.fail("Should have failed");
    } catch (e) {
      assert.ok(e.message.includes("Unauthorized") || e.message.includes("Signature verification failed"), "Expected error constraint");
    }
  });
});
