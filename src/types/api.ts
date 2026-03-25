export interface WalletState {
  address: string;
  balance: string;
  seed: string;
  type?: 'seed' | 'lace';
  laceInfo?: {
    coinPublicKey: string;
    encryptionPublicKey: string;
  };
}

export interface ApiError {
  message: string;
  details?: any;
}
