declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        apiVersion: string;
        isEnabled(): Promise<boolean>;
        enable(): Promise<any>;
        serviceUriConfig(): Promise<any>;
      };
    };
  }
}

export {};
