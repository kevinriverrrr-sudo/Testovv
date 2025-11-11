import { WireGuardConfig, VPNConnection } from './types';
import { Storage } from './storage';

export class WireGuardManager {
  private static isConnected = false;
  private static bytesIn = 0;
  private static bytesOut = 0;
  private static intervalId: number | null = null;

  static async connect(config: WireGuardConfig): Promise<boolean> {
    try {
      // Store config securely
      await Storage.setWireGuardConfig(config);

      // In a real implementation, this would load WASM module and establish connection
      // For MVP, we simulate the connection using Chrome's proxy API
      await this.setupProxy(config);

      this.isConnected = true;
      this.startStatsMonitoring();

      console.log('WireGuard connected to:', config.serverEndpoint);
      return true;
    } catch (error) {
      console.error('WireGuard connection failed:', error);
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      this.isConnected = false;
      this.stopStatsMonitoring();
      
      // Clear proxy settings
      await chrome.proxy.settings.clear({ scope: 'regular' });
      
      // Clear config
      await Storage.clearWireGuardConfig();
      
      console.log('WireGuard disconnected');
    } catch (error) {
      console.error('WireGuard disconnection failed:', error);
    }
  }

  private static async setupProxy(config: WireGuardConfig): Promise<void> {
    const [host, port] = config.serverEndpoint.split(':');
    
    const proxyConfig = {
      mode: 'fixed_servers' as chrome.types.ChromeSettingScope,
      rules: {
        singleProxy: {
          scheme: 'https',
          host: host,
          port: parseInt(port)
        },
        bypassList: ['localhost', '127.0.0.1']
      }
    };

    await chrome.proxy.settings.set({
      value: proxyConfig,
      scope: 'regular'
    });
  }

  private static startStatsMonitoring(): void {
    this.intervalId = setInterval(() => {
      if (this.isConnected) {
        // Simulate traffic monitoring
        this.bytesIn += Math.floor(Math.random() * 1000);
        this.bytesOut += Math.floor(Math.random() * 500);
      }
    }, 1000) as unknown as number;
  }

  private static stopStatsMonitoring(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.bytesIn = 0;
    this.bytesOut = 0;
  }

  static getStats(): { bytesIn: number; bytesOut: number } {
    return {
      bytesIn: this.bytesIn,
      bytesOut: this.bytesOut
    };
  }

  static isActive(): boolean {
    return this.isConnected;
  }

  static async testConnection(): Promise<number> {
    // Measure ping to server
    const start = Date.now();
    try {
      const config = await Storage.getWireGuardConfig();
      if (!config) return -1;
      
      const [host] = config.serverEndpoint.split(':');
      await fetch(`https://${host}`, { method: 'HEAD', mode: 'no-cors' });
      
      return Date.now() - start;
    } catch (error) {
      console.error('Connection test failed:', error);
      return -1;
    }
  }
}
