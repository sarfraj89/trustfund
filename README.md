# TrustFund - Milestone-Based Escrow Protocol 💸

TrustFund is a simple and clean **milestone-based escrow protocol** built on Solana with the Anchor framework. It is designed to be a hackathon-ready MVP for allowing clients and freelancers to transact safely utilizing SPL tokens (like USDC).

## 🚀 How it Works

1. **Initialization:** A Client initializes a Project, locking in a specific Project ID and setting themselves as the creator.
2. **Setup Milestones:** The Client defines milestones (ID and Amount) and deposits the SPL token amount into a transparent, programmatic Vault.
3. **Acceptance:** A Freelancer accepts the project, locking their Public Key to the Project.
4. **Fund Release:** Upon successful completion of the work, the Client triggers the release of the milestone funds, securely transferring the SPL tokens from the PDA Vault directly to the Freelancer.

## 🏗️ Architecture

- **Project Account:** Tracks the client, assigned freelancer, and project status (`Created`, `Accepted`).
- **Milestone Account:** Tracks milestone ID, amount, state (`Pending`, `Released`), and references the core Project.
- **PDA Vault:** SPL tokens are held by a Program Derived Address (PDA) Token Account uniquely tied to the Project. It effectively escrows the funds away from the Client but ensures only the smart contract can release them based on logic.

### PDA Explanation (Simplified)
To securely store tokens without needing a private key, the protocol generates **Program Derived Addresses (PDAs)**:
- **Project PDA:** `["project", client_pubkey]` 
- **Milestone PDA:** `["milestone", project_pubkey, milestone_id]`
- **Vault Token PDA:** `["vault_token", project_pubkey]`
- **Vault Authority PDA:** `["vault_auth", project_pubkey]` — This acts as the secure "signer" that authorizes transfers from the Vault Token PDA to the freelancer.

## ⚙️ Setup Instructions

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable)
- [Solana Tool Suite](https://docs.solana.com/cli/install-solana-cli-tools) (latest stable)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation) (v0.32)
- [Node.js](https://nodejs.org/en/) & Yarn

### 1. Installation
Clone the repo and install dependencies:
```bash
yarn install
```

### 2. Configure Environment Options
Copy the example environment variables:
```bash
cp .env.example .env
```
Ensure you update the `PRIVATE_KEY` path or `SOLANA_RPC_URL` if you aren't using a local validator.

## 🖥️ How to Run Locally & Test

1. Generate a new keypair if you haven't already:
```bash
solana-keygen new
```
2. Build the Anchor program:
```bash
anchor build
```
3. Test the program on a local validator (Note: IDL generation in Anchor 0.32 may require specific local adjustments depending on your `anchor-lang` version):
```bash
anchor test
```

## 🌐 Deploy to Devnet

1. Ensure your Solana configuration points to devnet:
```bash
solana config set --url devnet
```
2. Request devnet funds:
```bash
solana airdrop 2
```
3. Deploy the program:
```bash
anchor deploy
```
4. Copy the new Program ID outputting from the deployment, and update:
   - `declare_id!(...)` in `src/lib.rs`
   - `[programs.devnet]` in `Anchor.toml`
   - `PROGRAM_ID` inside of `.env`

## 🎤 Demo Instructions

For live presentations:
1. Ensure your local `solana-test-validator` is running.
2. Execute a front-end script (or using `anchor test`) to programmatically step through:
   - "A Client deposits 100 mock-USDC for Milestone #1."
   - "A Freelancer formally signs the agreement."
   - "Work is completed — the Client hits 'Release'."
   - "Observe the Freelancer's SPL Token wallet balance increase by 100!"
