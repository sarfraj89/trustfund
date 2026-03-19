import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { Trustfund } from '../idl/trustfund';
import idl from '../idl/trustfund.json';
import { useRole } from '../context/RoleContext';
import { SlideOver } from '../components/SlideOver';
import { InitializeProjectForm } from '../components/InitializeProjectForm';
import { FundMilestoneForm } from '../components/FundMilestoneForm';

const PROGRAM_ID = new PublicKey(idl.address);

interface ProjectData {
    publicKey: PublicKey;
    account: any;
    milestones: any[];
}

export const Pipeline = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const { role, permissions } = useRole();
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
            const projectAccounts = await (program.account as any).project.all();

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
        console.log("Program ID:", PROGRAM_ID.toBase58());
    }, [publicKey, connection, signTransaction, signAllTransactions]);

    const columns = [
        { id: 'Created', title: 'Created', status: { created: {} } },
        { id: 'Accepted', title: 'Accepted', status: { accepted: {} } },
        { id: 'In Progress', title: 'In Progress', isMilestoneActive: true },
        { id: 'Completed', title: 'Completed', isAllMilestonesReleased: true },
    ];

    // Helper to filter projects into columns
    const getProjectsInColumn = (colId: string) => {
        if (!projects.length) return [];

        return projects.filter(p => {
            const status = Object.keys(p.account.status)[0];
            if (colId === 'Created' && status === 'created') return true;
            if (colId === 'Accepted' && status === 'accepted') {
                // If accepted but no milestones released yet, or some in progress
                return true;
            }
            return false;
        });
    };

    const metrics = [
        { label: 'Active Projects', value: projects.length, icon: '📁', color: 'text-brand' },
        { label: 'Total Locked', value: '12,500 USDC', icon: '🔒', color: 'text-teal-dark' },
        { label: 'Released (Month)', value: '4,200 USDC', icon: '💸', color: 'text-purple-dark' },
        { label: 'Open Disputes', value: 3, icon: '⚖️', color: 'text-red-dark' },
    ];

    return (
        <div className="space-y-8 text-text">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-text mb-2">Project Pipeline</h1>
                    <p className="text-sm text-text-muted">Manage your trust-based milestones and escrows.</p>
                </div>
                {permissions.canInitProject && (
                    <button
                        onClick={() => setIsNewProjectOpen(true)}
                        className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-brand/20 flex items-center gap-2"
                    >
                        <span>+</span> New Project
                    </button>
                )}
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{m.icon}</span>
                            <span className={`text-xs font-bold uppercase tracking-wider opacity-60`}>MTD</span>
                        </div>
                        <div className="text-2xl font-bold">{m.value}</div>
                        <div className="text-xs text-text-muted mt-1">{m.label}</div>
                    </div>
                ))}
            </div>

            {/* RBAC Permissions Bar */}
            <div className="bg-surface p-4 rounded-xl border border-border flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Role:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${role === 'Admin' ? 'bg-purple-dark/20 text-purple-dark border border-purple-dark/30' :
                        role === 'Client' ? 'bg-teal-dark/20 text-teal-dark border border-teal-dark/30' :
                            role === 'Freelancer' ? 'bg-amber-dark/20 text-amber-dark border border-amber-dark/30' :
                                'bg-red-dark/20 text-red-dark border border-red-dark/30'
                        }`}>
                        {role}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Permissions:</span>
                    <div className="flex gap-3">
                        {[
                            { label: 'Init Project', allowed: permissions.canInitProject },
                            { label: 'Fund Milestone', allowed: permissions.canFundMilestone },
                            { label: 'Release Funds', allowed: permissions.canReleaseFunds },
                        ].map(p => (
                            <div key={p.label} className={`flex items-center gap-1.5 ${p.allowed ? 'text-text' : 'text-text-muted line-through'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${p.allowed ? 'bg-green-500' : 'bg-border'}`} />
                                <span className="text-[10px] font-medium">{p.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted flex items-center gap-2">
                                {col.title}
                                <span className="bg-border text-[10px] px-1.5 py-0.5 rounded-full text-text">{getProjectsInColumn(col.id).length}</span>
                            </h3>
                            <button className="text-text-muted hover:text-brand transition-colors">•••</button>
                        </div>

                        <div className="flex-1 bg-surface/30 rounded-xl border border-dashed border-border p-3 space-y-4">
                            {loading ? (
                                Array(2).fill(0).map((_, i) => (
                                    <div key={i} className="bg-surface p-4 rounded-lg border border-border animate-pulse h-32" />
                                ))
                            ) : (
                                <>
                                    {getProjectsInColumn(col.id).map((p: any) => (
                                        <div
                                            key={p.publicKey.toBase58()}
                                            onClick={() => permissions.canFundMilestone && setSelectedProjectForFunding(p)}
                                            className={`bg-surface p-4 rounded-lg border border-border shadow-sm group hover:border-brand transition-all cursor-pointer relative ${(p as any).disputed ? 'border-l-4 border-l-red-dark' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-mono text-text-muted">{p.publicKey.toBase58().slice(0, 8)}...</span>
                                                <div className="flex gap-1">
                                                    {(p as any).disputed && <span className="bg-red-dark text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Disputed</span>}
                                                    <span className="bg-purple-dark text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">USDC</span>
                                                </div>
                                            </div>
                                            <div className="font-bold text-sm mb-3 text-text group-hover:text-brand transition-colors">{p.account.projectId}</div>

                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-[10px] font-bold">
                                                    {p.account.client.toBase58().slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="text-[10px] text-text-muted">
                                                    {p.account.client.toBase58().slice(0, 4)}...{p.account.client.toBase58().slice(-4)}
                                                </div>
                                            </div>

                                            <div className="flex gap-1 h-[3px]">
                                                {p.milestones.map((m: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 rounded-[2px] ${Object.keys(m.status)[0].toLowerCase() === 'released' ? 'bg-green-500' :
                                                            Object.keys(m.status)[0].toLowerCase() === 'pending' ? 'bg-purple-dark' : 'bg-border'
                                                            }`}
                                                    />
                                                ))}
                                                {p.milestones.length === 0 && <div className="flex-1 rounded-[2px] bg-border" />}
                                            </div>
                                        </div>
                                    ))}
                                    {getProjectsInColumn(col.id).length === 0 && (
                                        <div className="text-center py-10 text-text-muted text-[10px] italic opacity-50">
                                            No projects in {col.title.toLowerCase()} stage
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
