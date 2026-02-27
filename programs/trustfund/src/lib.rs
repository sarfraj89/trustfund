use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("E6AD7h4owuhfsHLcMFQtoZR8aQVLTMDP2e8sM5nE61Sv");

#[program]
pub mod trustfund {
    use super::*;

    pub fn initialize_project(ctx: Context<InitializeProject>, project_id: String) -> Result<()> {
        let project = &mut ctx.accounts.project;
        project.client = ctx.accounts.client.key();
        project.freelancer = None;
        project.status = ProjectStatus::Created;
        project.project_id = project_id;
        Ok(())
    }

    pub fn add_milestone(ctx: Context<AddMilestone>, milestone_id: u8, amount: u64) -> Result<()> {
        let project = &ctx.accounts.project;
        require!(project.client == ctx.accounts.client.key(), ErrorCode::Unauthorized);

        let milestone = &mut ctx.accounts.milestone;
        milestone.project = project.key();
        milestone.milestone_id = milestone_id;
        milestone.amount = amount;
        milestone.status = MilestoneStatus::Pending;

        let cpi_accounts = Transfer {
            from: ctx.accounts.client_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.client.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn accept_project(ctx: Context<AcceptProject>) -> Result<()> {
        let project = &mut ctx.accounts.project;
        require!(project.status == ProjectStatus::Created, ErrorCode::ProjectAlreadyAccepted);
        
        project.freelancer = Some(ctx.accounts.freelancer.key());
        project.status = ProjectStatus::Accepted;
        Ok(())
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let project = &ctx.accounts.project;
        let milestone = &mut ctx.accounts.milestone;

        require!(project.client == ctx.accounts.client.key(), ErrorCode::Unauthorized);
        require!(milestone.project == project.key(), ErrorCode::Unauthorized);
        require!(project.status == ProjectStatus::Accepted, ErrorCode::ProjectNotAccepted);
        require!(milestone.status == MilestoneStatus::Pending, ErrorCode::MilestoneAlreadyReleased);
        require!(
            project.freelancer.is_some() && project.freelancer.unwrap() == ctx.accounts.freelancer_token_account.owner,
            ErrorCode::InvalidFreelancer
        );

        milestone.status = MilestoneStatus::Released;

        let bump = ctx.bumps.vault_authority;
        let seeds = &[
            b"vault_auth".as_ref(),
            project.to_account_info().key.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.freelancer_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::transfer(cpi_ctx, milestone.amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(project_id: String)]
pub struct InitializeProject<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        init,
        payer = client,
        space = 110,
        seeds = [b"project", client.key().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = client,
        seeds = [b"vault_token", project.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = vault_authority
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA authority for the vault
    #[account(
        seeds = [b"vault_auth", project.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(milestone_id: u8)]
pub struct AddMilestone<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = client,
        space = 57,
        seeds = [b"milestone", project.key().as_ref(), &[milestone_id]],
        bump
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(mut)]
    pub client_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault_token", project.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AcceptProject<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_token", project.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA authority for the vault
    #[account(
        seeds = [b"vault_auth", project.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub project: Account<'info, Project>,

    #[account(mut)]
    pub milestone: Account<'info, Milestone>,

    #[account(mut)]
    pub freelancer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Project {
    pub client: Pubkey,
    pub freelancer: Option<Pubkey>,
    pub status: ProjectStatus,
    pub project_id: String,
}

#[account]
pub struct Milestone {
    pub project: Pubkey,
    pub milestone_id: u8,
    pub amount: u64,
    pub status: MilestoneStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProjectStatus {
    Created,
    Accepted,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MilestoneStatus {
    Pending,
    Released,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Project has already been accepted.")]
    ProjectAlreadyAccepted,
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("Project has not been accepted yet.")]
    ProjectNotAccepted,
    #[msg("Milestone has already been released.")]
    MilestoneAlreadyReleased,
    #[msg("Invalid freelancer specified.")]
    InvalidFreelancer,
}
