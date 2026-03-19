import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, MapPin, Landmark, ReceiptText, Users, ScrollText, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
    name: string;
    icon: React.ReactNode;
    active?: boolean;
    badge?: number;
    onClick?: () => void;
}

interface MenuGroup {
    section: string;
    items: MenuItem[];
}

export const Sidebar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const menuItems: MenuGroup[] = [
        {
            section: 'Workspace',
            items: [
                { name: 'Dashboard', icon: <LayoutDashboard size={18} />, active: true, onClick: () => navigate('/dashboard') },
                { name: 'Projects', icon: <FolderKanban size={18} /> },
                { name: 'Milestones', icon: <MapPin size={18} /> },
            ]
        },
        {
            section: 'Finance',
            items: [
                { name: 'Treasury', icon: <Landmark size={18} /> },
                { name: 'Transactions', icon: <ReceiptText size={18} /> },
            ],
        }
    ];

    if (currentUser?.role === 'admin') {
        menuItems.push({
            section: 'Admin',
            items: [
                { name: 'Users & Roles', icon: <Users size={18} /> },
                { name: 'Audit Log', icon: <ScrollText size={18} /> },
                { name: 'Disputes', icon: <Scale size={18} />, badge: 3 },
            ]
        });
    }

    return (
        <aside className="w-[240px] h-screen sticky top-0 border-r border-border bg-surface flex flex-col pt-6">
            <div className="px-6 mb-8 text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm">T</div>
                Trust<span className="text-brand">Fund</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 space-y-8">
                {menuItems.map((group) => (
                    <div key={group.section}>
                        <h4 className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-4 px-2">
                            {group.section}
                        </h4>
                        <ul className="space-y-1">
                            {group.items.map((item) => (
                                <li key={item.name}>
                                    <button
                                        onClick={item.onClick}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${item.active
                                            ? 'bg-brand/10 text-brand font-bold'
                                            : 'text-text-muted hover:bg-white/5 hover:text-text'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="bg-red-dark text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="bg-bg/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                        {currentUser?.displayName?.slice(0, 2).toUpperCase() || '??'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{currentUser?.displayName}</div>
                        <div className="text-[10px] text-text-muted truncate">{currentUser?.pubkey.slice(0, 4)}...{currentUser?.pubkey.slice(-4)}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
