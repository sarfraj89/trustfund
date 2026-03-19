import { type ReactNode } from 'react';

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const SlideOver = ({ isOpen, onClose, title, children }: SlideOverProps) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity z-[60] ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed inset-y-0 right-0 w-full max-w-md bg-surface shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } border-l border-border`}
            >
                <div className="h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface sticky top-0">
                        <h2 className="text-xl font-bold text-brand">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface-hover rounded-full text-text-muted transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};
