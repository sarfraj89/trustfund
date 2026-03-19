import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { Trustfund } from '../idl/trustfund';
import idl from '../idl/trustfund.json';
import { FileText, Coins, Award, Percent, ChevronRight, Briefcase } from 'lucide-react';

interface ProjectData {
    publicKey: PublicKey;
    account: any;
    milestones: any[];
}

export const FreelancerDashboard = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [openProjects, setOpenProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!publicKey || !signTransaction || !signAllTransactions) {
            setLoading(false);
            return;
        }

        try {
            const provider = new AnchorProvider(connection, {
                publicKey, signTransaction, signAllTransactions
            } as any, { preflightCommitment: 'confirmed' });

            const program = new Program(idl as Trustfund, provider);

            // Fetch all projects
            const allProjects = await (program.account as any).project.all();

            // Filter active contracts for this freelancer
            const activeContracts = allProjects.filter((p: any) =>
                p.account.freelancer?.toBase58() === publicKey.toBase58()
            );

            // Filter open projects (Created state, no freelancer)
            const open = allProjects.filter((p: any) =>
                Object.keys(p.account.status)[0] === 'created' && !p.account.freelancer
            );

            // Fetch milestones for active contracts
            const activeWithMilestones = await Promise.all(
                activeContracts.map(async (project: any) => {
                    const milestones = await (program.account as any).milestone.all([
                        {
                            memcmp: {
                                offset: 8,
                                bytes: project.publicKey.toBase58(),
                            },
                        },
                    ]);
                    return {
                        ...project,
                        milestones: milestones.map((m: any) => m.account),
                    };
                })
            );

            // Fetch milestones for open projects to calculate budget
            const openWithMilestones = await Promise.all(
                open.map(async (project: any) => {
                    const milestones = await (program.account as any).milestone.all([
                        {
                            memcmp: {
                                offset: 8,
                                bytes: project.publicKey.toBase58(),
                            },
                        },
                    ]);
                    return {
                        ...project,
                        milestones: milestones.map((m: any) => m.account),
                    };
                })
            );

            setProjects(activeWithMilestones);
            setOpenProjects(openWithMilestones);
        } catch (error) {
            console.error("Error fetching freelancer data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptProject = async (projectPDA: PublicKey) => {
        if (!publicKey || !signTransaction || !signAllTransactions) return;

        try {
            const provider = new AnchorProvider(connection, {
                publicKey, signTransaction, signAllTransactions
            } as any, { preflightCommitment: 'confirmed' });

            const program = new Program(idl as Trustfund, provider);

            await (program.methods as any).acceptProject()
                .accounts({
                    freelancer: publicKey,
                    project: projectPDA,
                })
                .rpc();

            fetchData();
        } catch (error) {
            console.error("Error accepting project:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [publicKey, connection, signTransaction, signAllTransactions]);

    const metrics = [
        { label: 'Active Contracts', value: projects.length, icon: <FileText size={20} />, color: 'text-brand' },
        { label: 'Pending Payout', value: '4,800 USDC', icon: <Coins size={20} />, color: 'text-amber-500' },
        { label: 'Total Earned', value: '12,200 USDC', icon: <Award size={20} />, color: 'text-emerald-500' },
        { label: 'Completion Rate', value: '98%', icon: <Percent size={20} />, color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-white mb-2">My Work</h1>
                <p className="text-text-muted">Track your commitments and discover new opportunities.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-brand/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${m.color} p-2 rounded-xl bg-white/5`}>{m.icon}</div>
                            <span className={`text-[10px] font-black uppercase tracking-widest opacity-30`}>Stats</span>
                        </div>
                        <div className="text-3xl font-black text-white">{m.value}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">{m.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Active Contracts */}
                <div className="space-y-6">
                    <h2 className="font-black text-sm uppercase tracking-[0.2em] text-text-muted flex items-center gap-3">
                        Active Contracts
                        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    </h2>
                    <div className="space-y-4">
                        {loading ? (
                            Array(2).fill(0).map((_, i) => <div key={i} className="h-48 bg-surface rounded-3xl border border-border animate-pulse" />)
                        ) : projects.length > 0 ? (
                            projects.map(p => (
                                <div key={p.publicKey.toBase58()} className="bg-surface p-6 rounded-3xl border border-border hover:border-brand/40 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-white group-hover:text-brand transition-colors">{p.account.projectId}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center text-[8px] font-black text-brand">
                                                    {p.account.client.toBase58().slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Client: {p.account.client.toBase58().slice(0, 4)}...{p.account.client.toBase58().slice(-4)}</span>
                                            </div>
                                        </div>
                                        <button className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-white hover:bg-brand transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 my-6">
                                        <div className="bg-bg/50 p-3 rounded-2xl border border-border/50">
                                            <div className="text-[9px] font-black text-text-muted uppercase mb-1">Progress</div>
                                            <div className="flex gap-1 h-1.5">
                                                {p.milestones.map((m: any, i: number) => (
                                                    <div key={i} className={`flex-1 rounded-full ${Object.keys(m.status)[0].toLowerCase() === 'released' ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-bg/50 p-3 rounded-2xl border border-border/50">
                                            <div className="text-[9px] font-black text-text-muted uppercase mb-1">Next Payout</div>
                                            <div className="text-xs font-black text-emerald-500">
                                                {p.milestones.find((m: any) => Object.keys(m.status)[0].toLowerCase() === 'pending')?.amount?.toString() || '0'} USDC
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all">
                                        View Details
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="bg-surface/30 p-12 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 text-text-muted/30">
                                    <FileText size={40} />
                                </div>
                                <div className="text-xs font-black uppercase tracking-widest text-white/20">No active contracts</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Open Projects */}
                <div className="space-y-6">
                    <h2 className="font-black text-sm uppercase tracking-[0.2em] text-text-muted">Available Projects</h2>
                    <div className="space-y-4">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-surface rounded-3xl border border-border animate-pulse" />)
                        ) : openProjects.length > 0 ? (
                            openProjects.map(p => {
                                const totalBudget = p.milestones.reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0);
                                return (
                                    <div key={p.publicKey.toBase58()} className="bg-surface p-6 rounded-3xl border border-border hover:border-brand/40 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                                                <Briefcase size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white group-hover:text-brand transition-colors">{p.account.projectId}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">{totalBudget} USDC</span>
                                                    <span className="text-[10px] font-bold text-text-muted">• {p.milestones.length} Milestones</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAcceptProject(p.publicKey)}
                                            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand/20 active:scale-95"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-surface/30 p-12 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 text-text-muted/30">
                                    <Briefcase size={40} />
                                </div>
                                <div className="text-xs font-black uppercase tracking-widest text-white/20">Market is quiet right now</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
