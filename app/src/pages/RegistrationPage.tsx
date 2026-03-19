import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { Briefcase, Code, Check, ArrowRight, X } from 'lucide-react';

export const RegistrationPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Form state
    const [role, setRole] = useState<UserRole | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [preferredToken, setPreferredToken] = useState<'USDC' | 'SOL'>('USDC');

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) {
                setSkills([...skills, skillInput.trim()]);
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!role || !displayName) return;

        register({
            role,
            displayName,
            email: email || undefined,
            bio,
            skills: role === 'freelancer' ? skills : undefined,
            preferredToken,
        });

        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-bg selection:bg-brand selection:text-white flex flex-col items-center justify-center p-8">
            <div className="max-w-xl w-full space-y-12">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${step === 1 ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'bg-surface text-text-muted border border-border'}`}>1</div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'text-brand' : 'text-text-muted/50'}`}>Role</span>
                    </div>
                    <div className={`w-12 h-px transition-colors ${step === 2 ? 'bg-brand' : 'bg-border'}`} />
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${step === 2 ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'bg-surface text-text-muted border border-border'}`}>2</div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? 'text-brand' : 'text-text-muted/50'}`}>Profile</span>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        {step === 1 ? 'Choose your role' : 'Complete your profile'}
                    </h1>
                    <p className="text-text-muted font-medium">
                        {step === 1
                            ? 'Select how you want to use TrustFund'
                            : 'Tell us a bit more about yourself'}
                    </p>
                </div>

                {step === 1 ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Client Card */}
                            <button
                                onClick={() => setRole('client')}
                                className={`relative p-8 bg-surface rounded-[2rem] border-2 text-left transition-all hover:scale-[1.02] active:scale-95 group ${role === 'client' ? 'border-brand bg-brand/5 shadow-2xl shadow-brand/10' : 'border-border hover:border-white/10'
                                    }`}
                            >
                                {role === 'client' && (
                                    <div className="absolute -top-3 -right-3 bg-brand text-white p-1.5 rounded-xl shadow-lg border-4 border-bg">
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                )}
                                <div className="space-y-6">
                                    <div className={`p-4 rounded-2xl w-fit transition-colors ${role === 'client' ? 'bg-brand text-white' : 'bg-bg text-text-muted group-hover:text-white'}`}>
                                        <Briefcase size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">I'm a Client</h3>
                                        <p className="text-[13px] text-text-muted mt-2 leading-relaxed font-medium">
                                            I have work to be done. I'll post projects and release payments.
                                        </p>
                                    </div>
                                    <ul className="space-y-3 pt-6 border-t border-white/5">
                                        {['Post projects', 'Fund escrow', 'Release payments'].map(h => (
                                            <li key={h} className="text-[11px] font-bold flex items-center gap-3 text-text-muted">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand/40" /> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </button>

                            {/* Freelancer Card */}
                            <button
                                onClick={() => setRole('freelancer')}
                                className={`relative p-8 bg-surface rounded-[2rem] border-2 text-left transition-all hover:scale-[1.02] active:scale-95 group ${role === 'freelancer' ? 'border-brand bg-brand/5 shadow-2xl shadow-brand/10' : 'border-border hover:border-white/10'
                                    }`}
                            >
                                {role === 'freelancer' && (
                                    <div className="absolute -top-3 -right-3 bg-brand text-white p-1.5 rounded-xl shadow-lg border-4 border-bg">
                                        <Check size={14} strokeWidth={4} />
                                    </div>
                                )}
                                <div className="space-y-6">
                                    <div className={`p-4 rounded-2xl w-fit transition-colors ${role === 'freelancer' ? 'bg-brand text-white' : 'bg-bg text-text-muted group-hover:text-white'}`}>
                                        <Code size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">I'm a Freelancer</h3>
                                        <p className="text-[13px] text-text-muted mt-2 leading-relaxed font-medium">
                                            I deliver work. I'll browse projects and get paid securely.
                                        </p>
                                    </div>
                                    <ul className="space-y-3 pt-6 border-t border-white/5">
                                        {['Browse projects', 'Track milestones', 'Get paid on-chain'].map(h => (
                                            <li key={h} className="text-[11px] font-bold flex items-center gap-3 text-text-muted">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand/40" /> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </button>
                        </div>

                        <button
                            disabled={!role}
                            onClick={() => setStep(2)}
                            className="w-full h-16 bg-brand hover:scale-[1.01] active:scale-95 text-white rounded-[1.25rem] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3 shadow-2xl shadow-brand/40"
                        >
                            Continue <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-surface p-10 rounded-[2.5rem] border border-border space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Display Name</label>
                                <input
                                    required
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Satoshi"
                                    className="w-full bg-bg px-5 py-4 rounded-2xl border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-white placeholder:text-white/10"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="satoshi@bitcoin.org"
                                    className="w-full bg-bg px-5 py-4 rounded-2xl border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-white placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Short Bio</label>
                            <textarea
                                maxLength={160}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="I build decentralized systems..."
                                className="w-full bg-bg px-5 py-4 rounded-2xl border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-white placeholder:text-white/10 h-28 resize-none"
                            />
                            <div className="text-right text-[9px] font-black text-text-muted tracking-widest">{bio.length}/160</div>
                        </div>

                        {role === 'freelancer' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Skills (Press Enter)</label>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onKeyDown={handleAddSkill}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        placeholder="e.g. Rust, React"
                                        className="w-full bg-bg px-5 py-4 rounded-2xl border border-border focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-white placeholder:text-white/10"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map(s => (
                                            <div key={s} className="bg-brand/10 text-brand px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-brand/20 animate-in zoom-in-50 duration-300">
                                                {s}
                                                <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-white transition-colors">
                                                    <X size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Preferred Currency</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['USDC', 'SOL'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setPreferredToken(t as 'USDC' | 'SOL')}
                                        className={`py-4 rounded-2xl border-2 font-black transition-all ${preferredToken === t ? 'border-brand bg-brand/5 text-white' : 'border-border text-text-muted hover:border-white/10'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 h-16 border border-border hover:bg-white/5 text-text-muted font-black uppercase tracking-widest rounded-2xl transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] h-16 bg-brand hover:scale-[1.01] active:scale-95 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-brand/40"
                            >
                                Get Started
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
