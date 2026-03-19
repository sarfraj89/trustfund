import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export type UserRole = 'client' | 'freelancer' | 'admin' | 'auditor';

export interface UserProfile {
    pubkey: string;
    role: UserRole;
    displayName: string;
    email?: string;
    bio: string;
    skills?: string[];
    preferredToken: 'USDC' | 'SOL';
    registeredAt: number;
}

export interface UserPermissions {
    canInitProject: boolean;
    canFundMilestone: boolean;
    canReleaseFunds: boolean;
    canViewAllProjects: boolean;
    canAcceptProject: boolean;
    canSubmitMilestone: boolean;
}

interface AuthContextType {
    isWalletConnected: boolean;
    isRegistered: boolean;
    currentUser: UserProfile | null;
    isLoading: boolean;
    permissions: UserPermissions;
    login: (pubkey: string) => void;
    logout: () => void;
    register: (userData: Omit<UserProfile, 'pubkey' | 'registeredAt'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'trustfund_user_';

const DEFAULT_PERMISSIONS: UserPermissions = {
    canInitProject: false,
    canFundMilestone: false,
    canReleaseFunds: false,
    canViewAllProjects: false,
    canAcceptProject: false,
    canSubmitMilestone: false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { publicKey, connected, disconnect } = useWallet();
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isWalletConnected = connected && !!publicKey;
    const isRegistered = !!currentUser;

    useEffect(() => {
        const checkRegistration = async () => {
            if (connected && publicKey) {
                const pubkeyStr = publicKey.toBase58();
                const storedUser = localStorage.getItem(STORAGE_KEY_PREFIX + pubkeyStr);
                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                } else {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        };

        checkRegistration();
    }, [connected, publicKey]);

    const getPermissions = (role: UserRole | undefined): UserPermissions => {
        if (!role) return DEFAULT_PERMISSIONS;

        return {
            canInitProject: role === 'admin' || role === 'client',
            canFundMilestone: role === 'admin' || role === 'client',
            canReleaseFunds: role === 'admin' || role === 'client',
            canViewAllProjects: role === 'admin' || role === 'auditor' || role === 'client',
            canAcceptProject: role === 'admin' || role === 'freelancer',
            canSubmitMilestone: role === 'admin' || role === 'freelancer',
        };
    };

    const login = (pubkeyString: string) => {
        const storedUser = localStorage.getItem(STORAGE_KEY_PREFIX + pubkeyString);
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    };

    const logout = async () => {
        await disconnect();
        setCurrentUser(null);
    };

    const register = (userData: Omit<UserProfile, 'pubkey' | 'registeredAt'>) => {
        if (!publicKey) return;

        const pubkeyStr = publicKey.toBase58();
        const newUser: UserProfile = {
            ...userData,
            pubkey: pubkeyStr,
            registeredAt: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY_PREFIX + pubkeyStr, JSON.stringify(newUser));
        setCurrentUser(newUser);
    };

    const permissions = getPermissions(currentUser?.role);

    return (
        <AuthContext.Provider value={{
            isWalletConnected,
            isRegistered,
            currentUser,
            isLoading,
            permissions,
            login,
            logout,
            register
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
