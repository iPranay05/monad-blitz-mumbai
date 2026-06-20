export interface Gig {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  payout_monad: number;
  estimated_hours: number;
  status: 'active' | 'assigned' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Submission {
  id: string;
  gigId: string;
  workerName: string;
  submittedAt: string;
  textProof: string;
  locationMetadata: string;
  photoUrl?: string; // Base64 image
  files?: { url: string; name: string; type: string }[];
  status: 'pending' | 'APPROVED' | 'REJECTED' | 'REVISIONS_NEEDED';
  workerAddress?: string; // EVM address of the worker
  txHash?: string;        // MetaMask transaction hash if dispatched on-chain
  payoutMode?: 'simulated' | 'metamask'; // Payment ledger mode that processed it
  evaluation?: {
    status: 'APPROVED' | 'REJECTED' | 'REVISIONS_NEEDED';
    confidence_score: number;
    reasoning: string;
    payout_trigger: boolean;
    evaluatedAt: string;
  };
}

export interface TreasuryState {
  balance: number; // remaining corporate funds in MONAD
  paid: number;    // total payout approved in MONAD
  activeContracts: number; // gigs assigned or pending
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: 'gig_created' | 'gig_accepted' | 'submission_received' | 'evaluation_completed' | 'payout_triggered' | 'system_alert';
  message: string;
  details?: any;
}
