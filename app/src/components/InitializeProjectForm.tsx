import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Trustfund } from '../idl/trustfund';
import idl from '../idl/trustfund.json';

const PROGRAM_ID = new PublicKey(idl.address);

interface InitializeProjectFormProps {
    onComplete?: () => void;
}

export const InitializeProjectForm = ({ onComplete }: InitializeProjectFormProps) => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const [projectId, setProjectId] = useState("proj-" + Math.random().toString(36).slice(2, 7));
    const [mintAddress, setMintAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const initializeProject = async () => {
        if (!publicKey || !signTransaction || !signAllTransactions || !mintAddress) return;
        setLoading(true);
        try {
            const provider = new AnchorProvider(connection, {
                publicKey, signTransaction, signAllTransactions
            } as any, { preflightCommitment: 'confirmed' });

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
            alert("Project initialized!");
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
            alert("Error: " + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm text-text-muted mb-1">Project ID</label>
                <input
                    type="text"
                    className="w-full bg-bg p-2 rounded border border-border focus:border-brand focus:outline-none"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm text-text-muted mb-1">Escrow Token Mint (SPL)</label>
                <input
                    type="text"
                    placeholder="e.g. EPjFWdd5..."
                    className="w-full bg-bg p-2 rounded border border-border focus:border-brand focus:outline-none"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                />
            </div>
            <button
                onClick={initializeProject}
                disabled={!publicKey || !mintAddress || loading}
                className="w-full bg-brand hover:bg-brand-hover text-white py-2 px-4 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
            >
                {loading ? 'Initializing...' : 'Initialize Project'}
            </button>
        </div>
    );
};
