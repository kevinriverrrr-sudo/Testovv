import { VPNConnection, ConnectionStats, UserProfile, VPNServer } from '../lib/types';
import { API } from '../lib/api';
import { BackgroundAnimation } from './background-animation';

class PopupUI {
  private connection: VPNConnection | null = null;
  private stats: ConnectionStats | null = null;
  private profile: UserProfile | null = null;
  private servers: VPNServer[] = [];
  private backgroundAnimation: BackgroundAnimation;
  private updateInterval: number | null = null;

  constructor() {
    this.backgroundAnimation = new BackgroundAnimation('background-canvas');
    this.initialize();
  }

  async initialize(): Promise<void> {
    await this.loadData();
    this.setupEventListeners();
    this.render();
    this.backgroundAnimation.start();

    // Update UI every second
    this.updateInterval = setInterval(() => {
      this.loadData();
    }, 1000) as unknown as number;
  }

  private async loadData(): Promise<void> {
    // Get connection status
    const connResponse = await this.sendMessage({ type: 'GET_CONNECTION' });
    this.connection = connResponse.connection;

    // Get stats
    const statsResponse = await this.sendMessage({ type: 'GET_STATS' });
    this.stats = statsResponse.stats;

    // Get profile
    const profileResponse = await this.sendMessage({ type: 'GET_PROFILE' });
    this.profile = profileResponse.profile;

    // Get servers if not loaded
    if (this.servers.length === 0) {
      this.servers = await API.getServers();
    }

    this.render();
  }

  private setupEventListeners(): void {
    // Connect button
    document.getElementById('connect-button')?.addEventListener('click', () => {
      this.toggleConnection();
    });

    // Settings button
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Quick action buttons
    document.getElementById('smart-dns-btn')?.addEventListener('click', () => {
      this.toggleSmartDNS();
    });

    document.getElementById('kill-switch-btn')?.addEventListener('click', () => {
      this.toggleKillSwitch();
    });

    document.getElementById('anti-captcha-btn')?.addEventListener('click', () => {
      this.toggleAntiCaptcha();
    });

    // Upgrade link
    document.getElementById('upgrade-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'options.html?tab=billing' });
    });
  }

  private async toggleConnection(): Promise<void> {
    const button = document.getElementById('connect-circle');
    if (!button) return;

    if (this.connection?.connected) {
      // Disconnect
      button.textContent = 'Disconnecting...';
      button.classList.add('connecting');

      await this.sendMessage({ type: 'DISCONNECT' });

      button.classList.remove('connecting', 'connected');
      button.textContent = 'Connect';
    } else {
      // Connect
      button.textContent = 'Connecting...';
      button.classList.add('connecting');

      // Get optimal server
      const server = await API.getOptimalServer();
      if (server) {
        await this.sendMessage({ 
          type: 'CONNECT', 
          serverId: server.id 
        });

        button.classList.remove('connecting');
        button.classList.add('connected');
        button.textContent = 'Disconnect';
      }
    }

    await this.loadData();
  }

  private async toggleSmartDNS(): Promise<void> {
    if (!this.profile) return;

    this.profile.preferences.smartDNS = !this.profile.preferences.smartDNS;
    await this.sendMessage({
      type: 'UPDATE_PROFILE',
      updates: { preferences: this.profile.preferences }
    });

    this.updateQuickActionButtons();
  }

  private async toggleKillSwitch(): Promise<void> {
    if (!this.profile) return;

    this.profile.preferences.killSwitch = !this.profile.preferences.killSwitch;
    await this.sendMessage({
      type: 'UPDATE_PROFILE',
      updates: { preferences: this.profile.preferences }
    });

    this.updateQuickActionButtons();
  }

  private async toggleAntiCaptcha(): Promise<void> {
    if (!this.profile) return;

    this.profile.preferences.antiCaptcha = !this.profile.preferences.antiCaptcha;
    await this.sendMessage({
      type: 'UPDATE_PROFILE',
      updates: { preferences: this.profile.preferences }
    });

    this.updateQuickActionButtons();
  }

  private updateQuickActionButtons(): void {
    if (!this.profile) return;

    const smartDnsBtn = document.getElementById('smart-dns-btn');
    const killSwitchBtn = document.getElementById('kill-switch-btn');
    const antiCaptchaBtn = document.getElementById('anti-captcha-btn');

    if (smartDnsBtn) {
      smartDnsBtn.classList.toggle('active', this.profile.preferences.smartDNS);
    }

    if (killSwitchBtn) {
      killSwitchBtn.classList.toggle('active', this.profile.preferences.killSwitch);
    }

    if (antiCaptchaBtn) {
      antiCaptchaBtn.classList.toggle('active', this.profile.preferences.antiCaptcha);
    }
  }

  private render(): void {
    this.renderConnectionStatus();
    this.renderStats();
    this.renderServerList();
    this.renderAdBanner();
    this.updateQuickActionButtons();
  }

  private renderConnectionStatus(): void {
    const statusText = document.getElementById('status-text');
    const serverName = document.getElementById('server-name');
    const serverLocation = document.getElementById('server-location');
    const connectCircle = document.getElementById('connect-circle');
    const shieldDot = document.getElementById('shield-dot');

    if (this.connection?.connected && this.connection.server) {
      if (statusText) statusText.textContent = 'Connected';
      if (serverName) serverName.textContent = this.connection.server.name;
      if (serverLocation) serverLocation.textContent = `${this.connection.server.city}, ${this.connection.server.country}`;
      if (connectCircle) {
        connectCircle.classList.add('connected');
        connectCircle.textContent = 'Disconnect';
      }
      if (shieldDot) shieldDot.style.display = 'block';
    } else {
      if (statusText) statusText.textContent = 'Disconnected';
      if (serverName) serverName.textContent = 'Not Connected';
      if (serverLocation) serverLocation.textContent = '';
      if (connectCircle) {
        connectCircle.classList.remove('connected');
        connectCircle.textContent = 'Connect';
      }
      if (shieldDot) shieldDot.style.display = 'none';
    }
  }

  private renderStats(): void {
    if (!this.stats) return;

    const dataUsed = document.getElementById('data-used');
    const trackersBlocked = document.getElementById('trackers-blocked');
    const connectionTime = document.getElementById('connection-time');
    const ping = document.getElementById('ping');

    if (dataUsed) {
      const mb = (this.stats.totalData / (1024 * 1024)).toFixed(1);
      dataUsed.textContent = `${mb} MB`;
    }

    if (trackersBlocked) {
      trackersBlocked.textContent = String(this.stats.trackersBlocked);
    }

    if (connectionTime) {
      const minutes = Math.floor(this.stats.connectionTime / 60);
      connectionTime.textContent = `${minutes}m`;
    }

    if (ping && this.connection?.server) {
      ping.textContent = `${this.connection.server.ping} ms`;
    }
  }

  private renderServerList(): void {
    const serverList = document.getElementById('server-list');
    if (!serverList || this.servers.length === 0) return;

    serverList.innerHTML = this.servers.map(server => `
      <div class="server-item" data-server-id="${server.id}">
        <div class="server-info">
          <div class="server-item-name">${server.name}</div>
          <div class="server-item-location">${server.city}, ${server.country}</div>
        </div>
        <div class="server-ping">${server.ping}ms</div>
      </div>
    `).join('');

    // Add click listeners
    serverList.querySelectorAll('.server-item').forEach(item => {
      item.addEventListener('click', async () => {
        const serverId = item.getAttribute('data-server-id');
        if (serverId) {
          await this.sendMessage({ type: 'CONNECT', serverId });
          await this.loadData();
        }
      });
    });
  }

  private renderAdBanner(): void {
    const adBanner = document.getElementById('ad-banner');
    if (!adBanner) return;

    if (this.profile?.tier === 'free') {
      adBanner.style.display = 'block';
    } else {
      adBanner.style.display = 'none';
    }
  }

  private async sendMessage(message: any): Promise<any> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || {});
      });
    });
  }
}

// Initialize popup
new PopupUI();
