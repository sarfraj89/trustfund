import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../context/AuthContext';
import { LogOut, ExternalLink } from 'lucide-react';

export const Topbar = () => {
    const { currentUser, logout } = useAuth();

    return (
        <header className="h-16 border-b border-border bg-surface sticky top-0 z-50 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/20">
                    <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand">Devnet</span>
                </div>

                {currentUser && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${currentUser.role === 'client'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                        {currentUser.role}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 mr-4 text-text-muted">
                    <a href="https://explorer.solana.com" target="_blank" rel="noreferrer" className="hover:text-text transition-colors">
                        <ExternalLink size={16} />
                    </a>
                </div>
                <WalletMultiButton className="!bg-brand !rounded-xl !h-10 !text-xs !font-bold hover:!opacity-90 transition-opacity" />
                <button
                    onClick={logout}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
