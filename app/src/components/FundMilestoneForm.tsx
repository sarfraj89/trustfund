import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import type { Trustfund } from '../idl/trustfund';
import idl from '../idl/trustfund.json';

const PROGRAM_ID = new PublicKey(idl.address);

interface FundMilestoneFormProps {
    projectPDA: string;
    mintAddress: string;
    onComplete?: () => void;
}

export const FundMilestoneForm = ({ projectPDA, mintAddress, onComplete }: FundMilestoneFormProps) => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const [milestoneId, setMilestoneId] = useState(1);
    const [milestoneAmount, setMilestoneAmount] = useState<number | string>("1");
    const [loading, setLoading] = useState(false);

    const addMilestone = async () => {
        if (!publicKey || !signTransaction || !signAllTransactions || !mintAddress || !projectPDA) return;
        setLoading(true);
        try {
            const provider = new AnchorProvider(connection, {
                publicKey, signTransaction, signAllTransactions
            } as any, { preflightCommitment: 'confirmed' });

            const program = new Program(idl as Trustfund, provider);

            const projectPubKey = new PublicKey(projectPDA);
            const [milestonePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("milestone"), projectPubKey.toBuffer(), Buffer.from([milestoneId])],
                PROGRAM_ID
            );

            const [vaultTokenAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("vault_token"), projectPubKey.toBuffer()],
                PROGRAM_ID
            );

            const mintPubKey = new PublicKey(mintAddress);
            const clientTokenAccount = await getAssociatedTokenAddress(mintPubKey, publicKey);

            const rawAmount = Math.floor(parseFloat(milestoneAmount.toString()) * 1e9);

            const tx = await program.methods
                .addMilestone(milestoneId, new BN(rawAmount))
                .accounts({
                    milestone: milestonePDA,
                    project: projectPubKey,
                    clientTokenAccount: clientTokenAccount,
                    vaultTokenAccount: vaultTokenAccountPDA,
                    client: publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            console.log("Add milestone tx:", tx);
            alert("Milestone added!");
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
            <div className="p-3 bg-bg rounded border border-border mb-4">
                <div className="text-[10px] uppercase font-bold text-text-muted mb-1">Target Project</div>
                <div className="text-xs font-mono truncate">{projectPDA}</div>
            </div>

            <div>
                <label className="block text-sm text-text-muted mb-1">Milestone ID</label>
                <input
                    type="number"
                    className="w-full bg-bg p-2 rounded border border-border focus:border-brand focus:outline-none"
                    value={milestoneId}
                    onChange={(e) => setMilestoneId(parseInt(e.target.value))}
                />
            </div>
            <div>
                <label className="block text-sm text-text-muted mb-1">Amount (Tokens)</label>
                <input
                    type="number"
                    step="any"
                    className="w-full bg-bg p-2 rounded border border-border focus:border-brand focus:outline-none"
                    value={milestoneAmount}
                    onChange={(e) => setMilestoneAmount(e.target.value)}
                />
            </div>
            <button
                onClick={addMilestone}
                disabled={!publicKey || !mintAddress || loading}
                className="w-full bg-brand hover:bg-brand-hover text-white py-2 px-4 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
            >
                {loading ? 'Funding...' : 'Fund Milestone'}
            </button>
        </div>
    );
};
