import type { 
  WalletState
} from '../types/api';

class SdWhistleBAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    console.log(`WhistleB API initialized with base URL: ${this.baseUrl}`);
  }

  async buildFreshWallet(): Promise<WalletState> {
    try {
      const mockWallet: WalletState = {
        address: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        balance: '1000000',
        seed: Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };
      
      return new Promise(resolve => {
        setTimeout(() => resolve(mockWallet), 2000);
      });
    } catch (error) {
      throw new Error(`Failed to build fresh wallet: ${error}`);
    }
  }

  async buildWalletFromSeed(seed: string): Promise<WalletState> {
    try {
      if (!seed || seed.length !== 64) {
        throw new Error('Seed must be a 64-character hex string');
      }
      
      const mockWallet: WalletState = {
        address: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        balance: '2500000',
        seed: seed
      };
      
      return new Promise(resolve => {
        setTimeout(() => resolve(mockWallet), 1500);
      });
    } catch (error) {
      throw new Error(`Failed to build wallet from seed: ${error}`);
    }
  }
}

export const sdWhistleBAPI = new SdWhistleBAPI();
