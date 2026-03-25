interface DAppConnectorAPI {
  apiVersion: string;
  isEnabled(): Promise<boolean>;
  enable(): Promise<DAppConnectorWalletAPI>;
  serviceUriConfig(): Promise<ServiceUriConfig>;
}

interface DAppConnectorWalletAPI {
  state(): Promise<WalletInfo>;
  balanceAndProveTransaction(tx: any, newCoins: any[]): Promise<any>;
  submitTransaction(tx: any): Promise<string>;
}

interface ServiceUriConfig {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
}

interface WalletInfo {
  coinPublicKey: string;
  encryptionPublicKey: string;
  address: string;
}

export interface LaceWalletInfo {
  coinPublicKey: string;
  encryptionPublicKey: string;
  address: string;
}

export interface LaceWalletState {
  isConnected: boolean;
  walletInfo: LaceWalletInfo | null;
  isConnecting: boolean;
  error: string | null;
}

class SimpleObservable<T> {
  private subscribers: Array<(value: T) => void> = [];
  private currentValue: T;
  
  constructor(value: T) {
    this.currentValue = value;
  }
  
  subscribe(callback: (value: T) => void): { unsubscribe: () => void } {
    this.subscribers.push(callback);
    callback(this.currentValue);
    
    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      }
    };
  }
  
  next(newValue: T): void {
    this.currentValue = newValue;
    this.subscribers.forEach(callback => callback(newValue));
  }
  
  getValue(): T {
    return this.currentValue;
  }
  
  asObservable(): SimpleObservable<T> {
    return this;
  }
}

/**
 * Service for connecting to and managing the Midnight Lace wallet extension
 */
export class LaceWalletService {
  private static readonly STORAGE_KEY = 'WhistleB_wallet_connection';
  
  private walletStateSubject = new SimpleObservable<LaceWalletState>({
    isConnected: false,
    walletInfo: null,
    isConnecting: false,
    error: null,
  });

  private connectedWallet: DAppConnectorWalletAPI | null = null;
  private serviceUris: ServiceUriConfig | null = null;

  constructor() {
    // Try to restore a previous connection only if the user explicitly had one
    void this.checkExistingConnection();
  }

  get walletState$(): SimpleObservable<LaceWalletState> {
    return this.walletStateSubject.asObservable();
  }

  get currentState(): LaceWalletState {
    return this.walletStateSubject.getValue();
  }

  private saveConnectionState(walletInfo: LaceWalletInfo): void {
    try {
      const connectionData = {
        isConnected: true,
        walletInfo,
        timestamp: Date.now(),
      };
      localStorage.setItem(LaceWalletService.STORAGE_KEY, JSON.stringify(connectionData));
      console.log('💾 Wallet connection state saved');
    } catch (error) {
      console.warn('Failed to save wallet connection state:', error);
    }
  }

  private loadConnectionState(): { walletInfo: LaceWalletInfo; timestamp: number } | null {
    try {
      const stored = localStorage.getItem(LaceWalletService.STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - data.timestamp > maxAge) {
        this.clearConnectionState();
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to load wallet connection state:', error);
      return null;
    }
  }

  private clearConnectionState(): void {
    try {
      localStorage.removeItem(LaceWalletService.STORAGE_KEY);
      console.log('🗑️ Wallet connection state cleared');
    } catch (error) {
      console.warn('Failed to clear wallet connection state:', error);
    }
  }

  /**
   * On page load, only auto-restore a connection if:
   *  - we have a saved connection in localStorage, AND
   *  - the Lace connector reports this dApp is still enabled.
   *
   * This prevents the bug where:
   *  - user disconnects via our UI (we clear localStorage),
   *  - but the extension still has the dApp authorized,
   *  - and on refresh, we silently reconnect anyway.
   */
  private async checkExistingConnection(): Promise<void> {
    try {
      const storedConnection = this.loadConnectionState();

      // If we never saved a prior connection (or it expired), do not attempt auto-connect.
      if (!storedConnection) {
        this.updateState({
          isConnected: false,
          walletInfo: null,
          isConnecting: false,
          error: null,
        });
        return;
      }

      const connectorAPI = await this.getConnectorAPI();
      const isEnabled = await connectorAPI.isEnabled();

      if (isEnabled) {
        console.log('🔄 Attempting to restore wallet connection...');
        const { wallet, uris } = await this.connectToWallet();
        const walletState = await wallet.state();

        const walletInfo: LaceWalletInfo = {
          coinPublicKey: walletState.coinPublicKey,
          encryptionPublicKey: walletState.encryptionPublicKey,
          address: walletState.address,
        };

        this.connectedWallet = wallet;
        this.serviceUris = uris;

        this.updateState({
          isConnected: true,
          walletInfo,
          isConnecting: false,
          error: null,
        });

        this.saveConnectionState(walletInfo);
        console.log('✅ Wallet connection restored successfully');
      } else {
        // DApp is no longer enabled in the wallet – clear our stale record.
        this.clearConnectionState();
        this.updateState({
          isConnected: false,
          walletInfo: null,
          isConnecting: false,
          error: null,
        });
      }
    } catch (error) {
      console.debug('No existing wallet connection found or failed to restore:', error);
      this.clearConnectionState();
      this.updateState({
        isConnected: false,
        walletInfo: null,
        isConnecting: false,
        error: null,
      });
    }
  }

  /**
   * Connect to the Midnight Lace wallet extension
   */
  async connect(): Promise<LaceWalletInfo> {
    this.updateState({ isConnecting: true, error: null });

    try {
      const { wallet, uris } = await this.connectToWallet();
      const walletState = await wallet.state();

      const walletInfo: LaceWalletInfo = {
        coinPublicKey: walletState.coinPublicKey,
        encryptionPublicKey: walletState.encryptionPublicKey,
        address: walletState.address,
      };

      this.connectedWallet = wallet;
      this.serviceUris = uris;

      this.updateState({
        isConnected: true,
        walletInfo,
        isConnecting: false,
        error: null,
      });

      this.saveConnectionState(walletInfo);

      return walletInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to wallet';
      
      this.updateState({
        isConnected: false,
        walletInfo: null,
        isConnecting: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Disconnect from the wallet (app-level).
   * This clears our local state and localStorage, but does not revoke
   * authorization inside the wallet extension (there is no API for that here).
   * On next reload, we will NOT auto-connect because there is no stored state.
   */
  async disconnect(): Promise<void> {
    this.connectedWallet = null;
    this.serviceUris = null;
    
    this.clearConnectionState();

    this.updateState({
      isConnected: false,
      walletInfo: null,
      isConnecting: false,
      error: null,
    });
    
    console.log('🔌 Wallet disconnected');
  }

  /**
   * Get the connected wallet instance for transaction operations
   */
  getConnectedWallet(): DAppConnectorWalletAPI | null {
    return this.connectedWallet;
  }

  /**
   * Get service URIs for network configuration
   */
  getServiceUris(): ServiceUriConfig | null {
    return this.serviceUris;
  }

  private updateState(partial: Partial<LaceWalletState>): void {
    const currentState = this.walletStateSubject.getValue();
    this.walletStateSubject.next({ ...currentState, ...partial });
  }

  private async getConnectorAPI(): Promise<DAppConnectorAPI> {
    const COMPATIBLE_CONNECTOR_API_VERSION = '1.';

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals
      
      const checkForWallet = () => {
        console.log('🔍 Debugging Midnight Lace Detection:');
        console.log('window.midnight:', (window as any).midnight);
        
        if ((window as any).midnight) {
          console.log('Available properties:', Object.keys((window as any).midnight));
          
          const possiblePaths = [
            (window as any).midnight?.mnLace,
            (window as any).midnight?.lace,
            (window as any).midnight?.wallet,
            (window as any).midnight
          ];
          
          possiblePaths.forEach((api, index) => {
            if (api) {
              console.log(`Found API at path ${index}:`, api);
              console.log('API properties:', Object.keys(api));
              if (api.apiVersion) {
                console.log('API Version:', api.apiVersion);
              }
            }
          });
        }
        
        const connectorAPI = (window as any).midnight?.mnLace || 
                           (window as any).midnight?.lace ||
                           (window as any).midnight?.wallet;
        
        if (connectorAPI) {
          console.log('✅ Found connector API:', connectorAPI);
          console.log('API Version:', connectorAPI.apiVersion);
          
          if (
            !connectorAPI.apiVersion || 
            connectorAPI.apiVersion.startsWith(COMPATIBLE_CONNECTOR_API_VERSION) ||
            connectorAPI.apiVersion.includes('preview') ||
            connectorAPI.apiVersion.includes('dev')
          ) {
            console.log('✅ API version compatible or preview version');
            resolve(connectorAPI);
          } else {
            reject(
              new Error(
                `Incompatible version of Midnight Lace wallet found. Require '${COMPATIBLE_CONNECTOR_API_VERSION}x', got '${connectorAPI.apiVersion}'.`
              )
            );
          }
        } else if (attempts >= maxAttempts) {
          console.log('❌ No Midnight Lace wallet found after', maxAttempts, 'attempts');
          console.log('Final window.midnight state:', (window as any).midnight);
          reject(new Error('Could not find Midnight Lace wallet. Extension installed?'));
        } else {
          attempts++;
          setTimeout(checkForWallet, 100);
        }
      };
      
      checkForWallet();
    });
  }

  private async connectToWallet(): Promise<{ wallet: DAppConnectorWalletAPI; uris: ServiceUriConfig }> {
    const connectorAPI = await this.getConnectorAPI();
    
    console.log('🔍 Checking if wallet is enabled...');
    const isEnabled = await connectorAPI.isEnabled();
    console.log('Wallet enabled status:', isEnabled);
    
    if (!isEnabled) {
      console.log('🚀 Wallet not enabled, attempting to enable...');
      try {
        const walletConnectorAPI = await connectorAPI.enable();
        if (!walletConnectorAPI) {
          throw new Error('Failed to enable wallet. Please check your Lace extension and try again.');
        }
        
        console.log('✅ Wallet enabled successfully');
        const uris = await connectorAPI.serviceUriConfig();
        return { wallet: walletConnectorAPI, uris };
        
      } catch (enableError) {
        console.error('Enable error:', enableError);
        throw new Error(
          'Please enable the WhistleB app in your Lace wallet:\n\n' +
          '1. Click on the Lace extension icon\n' +
          '2. Go to Settings or Connected Sites\n' +
          '3. Find WhistleB and enable it\n' +
          '4. Refresh this page and try again'
        );
      }
    }

    console.log('✅ Wallet already enabled, getting wallet API...');
    const walletConnectorAPI = await connectorAPI.enable();
    if (!walletConnectorAPI) {
      throw new Error('Application is not authorized. Please authorize this application in your wallet.');
    }

    const uris = await connectorAPI.serviceUriConfig();
    console.log('✅ Successfully connected to wallet');

    return { wallet: walletConnectorAPI, uris };
  }
}

export const laceWalletService = new LaceWalletService();
