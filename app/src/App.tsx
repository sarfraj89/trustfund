import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AppWalletProvider } from './components/AppWalletProvider';
import { Dashboard } from './components/Dashboard';

import './index.css';

function App() {
  return (
    <AppWalletProvider>
      <div className="min-h-screen bg-bg text-text">
        <header className="border-b border-border bg-surface sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand to-brand-hover">
                TrustFund
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-border text-text-muted">Localnet</span>
            </div>
            <WalletMultiButton />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Milestone Escrow Protocol</h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Secure, milestone-based payments for freelancers and clients on Solana.
              Built for speed and trust.
            </p>
          </div>

          <Dashboard />
        </main>
      </div>
    </AppWalletProvider>
  )
}

export default App;
