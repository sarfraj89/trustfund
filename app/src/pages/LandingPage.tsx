import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, ChevronRight, Layout, Zap, Shield, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { OrbitScene } from '../components/OrbitScene';

export const LandingPage = () => {
    const { isWalletConnected, isRegistered } = useAuth();

    if (isWalletConnected) {
        if (isRegistered) {
            return <Navigate to="/dashboard" replace />;
        } else {
            return <Navigate to="/register" replace />;
        }
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
            {/* 3D Background */}
            <OrbitScene />

            {/* Nav */}
            <nav className="h-24 px-12 fixed top-0 w-full z-50 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center relative group">
                        <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="w-3 h-3 rounded-full bg-white z-10" />
                    </div>
                    <span className="text-3xl font-black tracking-tighter">TrustFund</span>
                </div>

                <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-600 to-blue-500">
                    <WalletMultiButton className="!bg-black !h-12 !px-10 !rounded-full !text-xs !font-black !uppercase !tracking-widest hover:!bg-transparent transition-all !shadow-none !border-none" />
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-44 pb-20 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between min-h-[90vh]">
                <div className="flex-1 space-y-10 z-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold uppercase tracking-widest animate-in fade-in duration-1000 mx-auto lg:mx-0">
                        <span className="bg-white/10 px-2 py-0.5 rounded-md text-[9px]">Live</span>
                        TrustFund Protocol v1.0
                        <ArrowRight size={14} className="text-white/40" />
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-black leading-[0.95] tracking-tighter animate-in fade-in slide-in-from-bottom-12 duration-700">
                        The world's most <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient bg-[length:200%_auto]">trusted escrow</span>
                    </h1>

                    <p className="text-lg lg:text-xl text-white/50 max-w-2xl font-medium leading-relaxed animate-in fade-in duration-1000 delay-300 mx-auto lg:mx-0">
                        Secure your milestones and automate payments with the most flexible
                        on-chain escrow protocol. Built for trust, powered by Solana.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                        <div className="p-[1px] rounded-full bg-gradient-to-r from-purple-600 to-blue-500">
                            <WalletMultiButton
                                className="!bg-black !h-14 !px-12 !rounded-full !text-sm !font-black !uppercase !tracking-widest hover:!bg-transparent transition-all !shadow-none !border-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side UI Card Mockup */}
                <div className="hidden lg:block relative group p-1 z-10 mt-20 lg:mt-0">
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl shadow-2xl w-[400px] transform hover:-rotate-1 transition-transform duration-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Layout size={20} className="text-white/40" />
                            </div>
                            <div className="flex-1">
                                <div className="h-1.5 w-1/3 bg-white/10 rounded-full mb-2" />
                                <div className="h-1.5 w-1/2 bg-white/5 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:border-purple-500/30 transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <Shield size={18} className="text-purple-400" />
                                    <span className="text-sm font-semibold text-white/80">Secure Vault</span>
                                </div>
                                <ChevronRight size={16} className="text-white/20" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:border-blue-500/30 transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <Zap size={18} className="text-blue-400" />
                                    <span className="text-sm font-semibold text-white/80">Instant Release</span>
                                </div>
                                <ChevronRight size={16} className="text-white/20" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:border-green-500/30 transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-green-400" />
                                    <span className="text-sm font-semibold text-white/80">Cross-border Pay</span>
                                </div>
                                <ChevronRight size={16} className="text-white/20" />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/30">
                            <span>Future of Trust</span>
                            <div className="flex -space-x-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-white/10" />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Floating Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-600/10 blur-[100px] -z-10 group-hover:bg-purple-600/20 transition-all duration-1000" />
                </div>
            </main>

            {/* Bottom Content Card */}
            <div className="fixed bottom-12 right-12 z-20 hidden xl:block animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl flex items-center gap-6 shadow-2xl max-w-sm group hover:border-white/20 transition-all cursor-default">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center relative flex-shrink-0">
                        <div className="w-10 h-8 bg-black/60 rounded-md border border-white/5" />
                        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">The Future of Escrow</div>
                        <div className="text-[11px] font-medium text-white/40 leading-relaxed">Secure, automated, and immutable. Welcome to TrustFund Protocol.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
