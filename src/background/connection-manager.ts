import { VPNServer, VPNConnection, ConnectionStats } from '../lib/types';
import { API } from '../lib/api';
import { Storage } from '../lib/storage';
import { WireGuardManager } from '../lib/wireguard';
import { KillSwitch } from '../lib/killswitch';
import { SplitTunneling } from '../lib/splittunnel';

export class ConnectionManager {
  private checkIntervalId: number | null = null;

  async autoConnect(): Promise<boolean> {
    try {
      const server = await API.getOptimalServer();
      if (!server) return false;

      return await this.connect(server.id);
    } catch (error) {
      console.error('Auto-connect failed:', error);
      return false;
    }
  }

  async connect(serverId: string, doubleHopServerId?: string): Promise<boolean> {
    try {
      const servers = await API.getServers();
      const server = servers.find(s => s.id === serverId);
      
      if (!server) {
        throw new Error('Server not found');
      }

      // Generate WireGuard config
      const config = await API.generateWireGuardConfig(serverId);
      if (!config) {
        throw new Error('Failed to generate config');
      }

      // Connect primary server
      const connected = await WireGuardManager.connect(config);
      
      if (!connected) {
        throw new Error('Connection failed');
      }

      // Handle double hop if specified
      if (doubleHopServerId) {
        const secondConfig = await API.generateWireGuardConfig(doubleHopServerId);
        if (secondConfig) {
          // In real implementation, chain the connections
          console.log('Double hop configured:', doubleHopServerId);
        }
      }

      // Update connection state
      const connection: VPNConnection = {
        connected: true,
        server: server,
        bytesIn: 0,
        bytesOut: 0,
        connectedAt: Date.now(),
        protocol: server.protocol
      };

      await Storage.setConnection(connection);

      // Apply split tunneling rules
      const profile = await Storage.getUserProfile();
      if (profile) {
        await SplitTunneling.updateRules(
          profile.preferences.domains,
          profile.preferences.splitTunneling
        );
      }

      // Disable kill switch since we're connected
      await KillSwitch.disable();

      console.log('Connected to VPN:', server.name);
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      await this.handleConnectionFailure();
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await WireGuardManager.disconnect();

      const connection: VPNConnection = {
        connected: false,
        server: null,
        bytesIn: 0,
        bytesOut: 0,
        connectedAt: null,
        protocol: 'wireguard'
      };

      await Storage.setConnection(connection);
      
      console.log('Disconnected from VPN');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  async checkConnection(): Promise<void> {
    const connection = await Storage.getConnection();
    
    if (!connection?.connected) return;

    // Test connection
    const ping = await WireGuardManager.testConnection();
    
    if (ping === -1) {
      // Connection lost
      await this.handleConnectionFailure();
    } else {
      // Update stats
      const stats = WireGuardManager.getStats();
      const currentStats = await Storage.getStats() || {
        totalData: 0,
        trackersBlocked: 0,
        captchasSolved: 0,
        connectionTime: 0,
        serverSwitches: 0
      };

      currentStats.totalData += stats.bytesIn + stats.bytesOut;
      currentStats.connectionTime += 60; // 1 minute

      await Storage.setStats(currentStats);

      // Update connection stats
      connection.bytesIn += stats.bytesIn;
      connection.bytesOut += stats.bytesOut;
      await Storage.setConnection(connection);
    }
  }

  private async handleConnectionFailure(): Promise<void> {
    console.error('VPN connection lost');

    // Activate kill switch
    await KillSwitch.onConnectionLost();

    // Try to reconnect
    const connection = await Storage.getConnection();
    if (connection?.server) {
      setTimeout(() => {
        this.connect(connection.server!.id);
      }, 5000);
    }
  }

  async switchServer(serverId: string): Promise<boolean> {
    await this.disconnect();
    return await this.connect(serverId);
  }

  async getCurrentConnection(): Promise<VPNConnection | null> {
    return await Storage.getConnection();
  }

  async getStats(): Promise<ConnectionStats | null> {
    return await Storage.getStats();
  }
}
