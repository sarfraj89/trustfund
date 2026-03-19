import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { Trustfund } from '../idl/trustfund';
import idl from '../idl/trustfund.json';
import { useAuth } from '../context/AuthContext';
import { SlideOver } from '../components/SlideOver';
import { InitializeProjectForm } from '../components/InitializeProjectForm';
import { FundMilestoneForm } from '../components/FundMilestoneForm';
import { Briefcase, Lock, CircleDollarSign, Users, Plus } from 'lucide-react';

interface ProjectData {
    publicKey: PublicKey;
    account: any;
    milestones: any[];
}

export const ClientDashboard = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const { permissions } = useAuth();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);

    // Slide-over states
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [selectedProjectForFunding, setSelectedProjectForFunding] = useState<ProjectData | null>(null);

    const fetchProjects = async () => {
        if (!publicKey || !signTransaction || !signAllTransactions) {
            setLoading(false);
            return;
        }

        try {
            const provider = new AnchorProvider(connection, {
                publicKey, signTransaction, signAllTransactions
            } as any, { preflightCommitment: 'confirmed' });

            const program = new Program(idl as Trustfund, provider);
            const projectAccounts = await (program.account as any).project.all([
                {
                    memcmp: {
                        offset: 8, // Discriminator
                        bytes: publicKey.toBase58(),
                    },
                },
            ]);

            const projectsWithMilestones = await Promise.all(
                projectAccounts.map(async (project: any) => {
                    const milestones = await (program.account as any).milestone.all([
                        {
                            memcmp: {
                                offset: 8, // Discriminator
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

            setProjects(projectsWithMilestones);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [publicKey, connection, signTransaction, signAllTransactions]);

    const columns = [
        { id: 'Created', title: 'Created' },
        { id: 'Accepted', title: 'Accepted' },
        { id: 'In Progress', title: 'In Progress' },
        { id: 'Completed', title: 'Completed' },
    ];

    const getProjectsInColumn = (colId: string) => {
        if (!projects.length) return [];
        return projects.filter(p => {
            const status = Object.keys(p.account.status)[0];
            if (colId === 'Created' && status === 'created') return true;
            if (colId === 'Accepted' && status === 'accepted') return true;
            // Simplified logic for "In Progress" and "Completed"
            if (colId === 'In Progress' && status === 'accepted' && p.milestones.some((m: any) => Object.keys(m.status)[0].toLowerCase() === 'pending')) return true;
            if (colId === 'Completed' && status === 'accepted' && p.milestones.every((m: any) => Object.keys(m.status)[0].toLowerCase() === 'released')) return true;
            return false;
        });
    };

    const metrics = [
        { label: 'Active Projects', value: projects.length, icon: <Briefcase size={20} />, color: 'text-brand' },
        { label: 'Total Locked', value: '12,500 USDC', icon: <Lock size={20} />, color: 'text-emerald-500' },
        { label: 'Released', value: '4,200 USDC', icon: <CircleDollarSign size={20} />, color: 'text-purple-500' },
        { label: 'Freelancers', value: projects.filter(p => p.account.freelancer).length, icon: <Users size={20} />, color: 'text-amber-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Workspace</h1>
                    <p className="text-text-muted">Manage your trust-based milestones and escrows.</p>
                </div>
                {permissions.canInitProject && (
                    <button
                        onClick={() => setIsNewProjectOpen(true)}
                        className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={20} /> New Project
                    </button>
                )}
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-brand/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${m.color} p-2 rounded-xl bg-white/5`}>{m.icon}</div>
                            <span className={`text-[10px] font-black uppercase tracking-widest opacity-30`}>Current</span>
                        </div>
                        <div className="text-3xl font-black text-white">{m.value}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">{m.label}</div>
                    </div>
                ))}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 min-h-[600px]">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                                {col.title}
                                <span className="bg-white/5 text-[10px] px-2 py-0.5 rounded-full text-text-muted">{getProjectsInColumn(col.id).length}</span>
                            </h3>
                        </div>

                        <div className="flex-1 bg-surface/20 rounded-[2rem] border border-dashed border-border/50 p-4 space-y-4">
                            {loading ? (
                                Array(2).fill(0).map((_, i) => (
                                    <div key={i} className="bg-surface p-6 rounded-2xl border border-border animate-pulse h-40" />
                                ))
                            ) : (
                                <>
                                    {getProjectsInColumn(col.id).map((p: any) => (
                                        <div
                                            key={p.publicKey.toBase58()}
                                            onClick={() => permissions.canFundMilestone && setSelectedProjectForFunding(p)}
                                            className={`bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-brand transition-all cursor-pointer relative hover:shadow-xl hover:shadow-brand/5`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-mono font-bold text-text-muted/50">{p.publicKey.toBase58().slice(0, 8)}...</span>
                                                <div className="flex gap-1">
                                                    <span className="bg-brand/10 text-brand text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest">USDC</span>
                                                </div>
                                            </div>
                                            <div className="font-black text-lg mb-4 text-white group-hover:text-brand transition-colors line-clamp-1">{p.account.projectId}</div>

                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-xl bg-white/5 border border-border flex items-center justify-center text-[10px] font-black text-brand">
                                                    {p.account.client.toBase58().slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Client</div>
                                                    <div className="text-[10px] font-mono text-text-muted/70">
                                                        {p.account.client.toBase58().slice(0, 4)}...{p.account.client.toBase58().slice(-4)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Progress</span>
                                                    <span className="text-[9px] font-black text-brand">{p.milestones.length > 0 ? (p.milestones.filter((m: any) => Object.keys(m.status)[0].toLowerCase() === 'released').length / p.milestones.length * 100).toFixed(0) : 0}%</span>
                                                </div>
                                                <div className="flex gap-1.5 h-1.5">
                                                    {p.milestones.map((m: any, i: number) => (
                                                        <div
                                                            key={i}
                                                            className={`flex-1 rounded-full ${Object.keys(m.status)[0].toLowerCase() === 'released' ? 'bg-emerald-500' :
                                                                Object.keys(m.status)[0].toLowerCase() === 'pending' ? 'bg-brand' : 'bg-white/5'
                                                                }`}
                                                        />
                                                    ))}
                                                    {p.milestones.length === 0 && <div className="flex-1 rounded-full bg-white/5" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {getProjectsInColumn(col.id).length === 0 && (
                                        <div className="text-center py-20 text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] opacity-20">
                                            Empty Stage
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Slide-overs */}
            <SlideOver
                isOpen={isNewProjectOpen}
                onClose={() => setIsNewProjectOpen(false)}
                title="Initialize New Project"
            >
                <InitializeProjectForm onComplete={() => {
                    setIsNewProjectOpen(false);
                    fetchProjects();
                }} />
            </SlideOver>

            <SlideOver
                isOpen={!!selectedProjectForFunding}
                onClose={() => setSelectedProjectForFunding(null)}
                title="Fund Milestone"
            >
                {selectedProjectForFunding && (
                    <FundMilestoneForm
                        projectPDA={selectedProjectForFunding.publicKey.toBase58()}
                        mintAddress={"" /* In real app, get from project account or prompt user */}
                        onComplete={() => {
                            setSelectedProjectForFunding(null);
                            fetchProjects();
                        }}
                    />
                )}
            </SlideOver>
        </div>
    );
};
