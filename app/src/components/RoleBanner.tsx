import { useAuth } from '../context/AuthContext';
import { Shield, Briefcase, Code, Search } from 'lucide-react';

export const RoleBanner = () => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    const config = {
        admin: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'Full System Access', icon: <Shield size={14} className="text-purple-500" /> },
        client: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'Project Owner Access', icon: <Briefcase size={14} className="text-emerald-500" /> },
        freelancer: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'Active Contracts Only', icon: <Code size={14} className="text-amber-500" /> },
        auditor: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'Read-Only Audit Access', icon: <Search size={14} className="text-rose-500" /> },
    };

    const { bg, border, text, icon } = config[currentUser.role];

    return (
        <div className={`${bg} ${border} border-y text-text-muted px-6 py-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest`}>
            {icon}
            <span>Current Role: <strong className="text-text">{currentUser.role}</strong></span>
            <span className="opacity-30">|</span>
            <span>{text}</span>
        </div>
    );
};
