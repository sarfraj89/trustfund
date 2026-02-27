import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import type { Trustfund } from '../idl/trustfund';
import idl from '../idl/trustfund.json';

const PROGRAM_ID = new PublicKey(idl.address);
// For testing, we use a constant mint. In a real app this would be selected or created dynamically.
// We'll let the user input the mint address for the test tokens.
export const Dashboard = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const [projectId, setProjectId] = useState("proj-demo-1");
    const [mintAddress, setMintAddress] = useState("");

    const [milestoneId, setMilestoneId] = useState(1);
    const [milestoneAmount, setMilestoneAmount] = useState<number | string>("1");
    const [solBalance, setSolBalance] = useState<number | null>(null);

    // Fetch SOL Balance for dev helper
    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then(lamports => {
                setSolBalance(lamports / web3.LAMPORTS_PER_SOL);
            });
        }
    }, [publicKey, connection]);

    const requestAirdrop = async () => {
        if (!publicKey) return;
        try {
            const signature = await connection.requestAirdrop(publicKey, 10 * web3.LAMPORTS_PER_SOL);
            await connection.confirmTransaction(signature);
            alert("Airdrop successful! You now have some test SOL.");
            const lamports = await connection.getBalance(publicKey);
            setSolBalance(lamports / web3.LAMPORTS_PER_SOL);
        } catch (e) {
            console.error(e);
            alert("Airdrop failed. Check console.");
        }
    };

    const getProvider = () => {
        if (!publicKey || !signTransaction || !signAllTransactions) return null;
        return new AnchorProvider(connection, {
            publicKey, signTransaction, signAllTransactions
        }, { preflightCommitment: 'confirmed' });
    };

    const initializeProject = async () => {
        const provider = getProvider();
        if (!provider || !publicKey) return;

        try {
            const program = new Program(idl as Trustfund, provider);

            const [projectPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("project"), publicKey.toBuffer()],
                PROGRAM_ID
            );

            const [vaultTokenAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault_token"), projectPDA.toBuffer()],
                PROGRAM_ID
            );

            const [vaultAuthorityPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault_auth"), projectPDA.toBuffer()],
                PROGRAM_ID
            );

            const mintPubKey = new PublicKey(mintAddress);

            const tx = await program.methods
                .initializeProject(projectId)
                .accounts({
                    project: projectPDA,
                    vaultTokenAccount: vaultTokenAccountPDA,
                    vaultAuthority: vaultAuthorityPDA,
                    mint: mintPubKey,
                    client: publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            console.log("Initialize tx:", tx);
            alert("Project initialized! Tx: " + tx);
        } catch (error) {
            console.error(error);
            alert("Error: " + error);
        }
    };

    const addMilestone = async () => {
        const provider = getProvider();
        if (!provider || !publicKey) return;

        try {
            const program = new Program(idl as Trustfund, provider);

            // Need client PDA to find project
            const [projectPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("project"), publicKey.toBuffer()],
                PROGRAM_ID
            );

            const [milestonePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("milestone"), projectPDA.toBuffer(), Buffer.from([milestoneId])],
                PROGRAM_ID
            );

            const [vaultTokenAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault_token"), projectPDA.toBuffer()],
                PROGRAM_ID
            );

            const mintPubKey = new PublicKey(mintAddress);
            const clientTokenAccount = await getAssociatedTokenAddress(mintPubKey, publicKey);

            // Convert token decimal amount to raw units integers for BN (assuming 9 decimals for standard SPL test token)
            // Example: 1 token = 1_000_000_000 raw units
            const rawAmount = Math.floor(parseFloat(milestoneAmount.toString()) * 1e9);

            const tx = await program.methods
                .addMilestone(milestoneId, new BN(rawAmount))
                .accounts({
                    milestone: milestonePDA,
                    project: projectPDA,
                    clientTokenAccount: clientTokenAccount,
                    vaultTokenAccount: vaultTokenAccountPDA,
                    client: publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            console.log("Add milestone tx:", tx);
            alert("Milestone added!");
        } catch (error) {
            console.error(error);
            alert("Error: " + error);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-10 p-6 bg-surface rounded-xl shadow-xl border border-border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand">Client Dashboard</h2>
                {publicKey && (
                    <div className="text-sm bg-bg px-3 py-2 rounded border border-border flex items-center gap-3">
                        <span className="text-text-muted">SOL Balance: <span className="font-mono text-white">{solBalance !== null ? solBalance.toFixed(2) : "..."}</span></span>
                        {solBalance !== null && solBalance < 0.1 && (
                            <button onClick={requestAirdrop} className="bg-brand/20 text-brand px-2 py-1 rounded text-xs border border-brand/30 hover:bg-brand/30 transition-colors">
                                Get Test SOL
                            </button>
                        )}
                    </div>
                )}
            </div>

            {publicKey && solBalance !== null && solBalance < 0.1 && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    <strong>Notice:</strong> Your wallet has 0 SOL! You cannot perform any transactions without SOL to pay network fees. Click "Get Test SOL" above.
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Project Setup */}
                <div className="space-y-4 p-4 bg-bg rounded-lg border border-border">
                    <h3 className="text-xl font-semibold mb-2">1. Initialize Project</h3>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Project ID</label>
                        <input
                            type="text"
                            className="w-full bg-surface p-2 rounded border border-border focus:border-brand focus:outline-none"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Escrow Token Mint (SPL)</label>
                        <input
                            type="text"
                            placeholder="e.g. EPjFWdd5..."
                            className="w-full bg-surface p-2 rounded border border-border focus:border-brand focus:outline-none"
                            value={mintAddress}
                            onChange={(e) => setMintAddress(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={initializeProject}
                        disabled={!publicKey || !mintAddress}
                        className="w-full bg-brand hover:bg-brand-hover text-white py-2 px-4 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Initialize Project
                    </button>
                </div>

                {/* Milestone Funding */}
                <div className="space-y-4 p-4 bg-bg rounded-lg border border-border">
                    <h3 className="text-xl font-semibold mb-2">2. Fund Milestone</h3>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Milestone ID</label>
                        <input
                            type="number"
                            className="w-full bg-surface p-2 rounded border border-border focus:border-brand focus:outline-none"
                            value={milestoneId}
                            onChange={(e) => setMilestoneId(parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">Amount (Tokens)</label>
                        <input
                            type="number"
                            step="any"
                            className="w-full bg-surface p-2 rounded border border-border focus:border-brand focus:outline-none"
                            value={milestoneAmount}
                            onChange={(e) => setMilestoneAmount(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={addMilestone}
                        disabled={!publicKey || !mintAddress}
                        className="w-full bg-brand hover:bg-brand-hover text-white py-2 px-4 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Fund Milestone
                    </button>
                </div>
            </div>
        </div>
    );
};
