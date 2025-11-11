import { UserProfile, DomainRule } from '../lib/types';
import { SplitTunneling } from '../lib/splittunnel';

class OptionsPage {
  private profile: UserProfile | null = null;
  private currentStep = 0;
  private onboardingSteps = [
    {
      title: 'Welcome to HomeNet VPN',
      description: 'One click - and you\'re home. Return to your home internet with a single click.'
    },
    {
      title: 'Permissions Required',
      description: 'We need access to proxy settings, tabs, and network requests to protect your connection.'
    },
    {
      title: 'Choose Your Plan',
      description: 'Start with 2 GB free per month, or upgrade to unlimited for €3/month.'
    }
  ];

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    // Check if onboarding is needed
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('onboarding') === 'true') {
      await this.showOnboarding();
    }

    await this.loadProfile();
    this.setupEventListeners();
    this.render();
  }

  private async showOnboarding(): Promise<void> {
    const onboarding = document.getElementById('onboarding');
    if (!onboarding) return;

    onboarding.style.display = 'flex';
    this.renderOnboardingStep();

    const nextBtn = document.getElementById('onboarding-next');
    nextBtn?.addEventListener('click', () => {
      this.currentStep++;
      if (this.currentStep >= this.onboardingSteps.length) {
        this.completeOnboarding();
      } else {
        this.renderOnboardingStep();
      }
    });
  }

  private renderOnboardingStep(): void {
    const step = this.onboardingSteps[this.currentStep];
    const title = document.getElementById('onboarding-title');
    const description = document.getElementById('onboarding-description');
    const nextBtn = document.getElementById('onboarding-next');

    if (title) title.textContent = step.title;
    if (description) description.textContent = step.description;
    
    if (nextBtn) {
      nextBtn.textContent = this.currentStep === this.onboardingSteps.length - 1 ? 'Get Started' : 'Next';
    }

    // Update step dots
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentStep);
    });
  }

  private async completeOnboarding(): Promise<void> {
    await chrome.storage.local.set({ onboardingComplete: true });
    const onboarding = document.getElementById('onboarding');
    if (onboarding) onboarding.style.display = 'none';
  }

  private async loadProfile(): Promise<void> {
    const response = await this.sendMessage({ type: 'GET_PROFILE' });
    this.profile = response.profile;
  }

  private setupEventListeners(): void {
    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.getAttribute('data-tab') || 'general');
      });
    });

    // General settings
    this.setupToggle('auto-connect-toggle', 'autoConnect');
    this.setupToggle('kill-switch-toggle', 'killSwitch');
    this.setupToggle('smart-dns-toggle', 'smartDNS');
    this.setupToggle('anti-captcha-toggle', 'antiCaptcha');

    // Theme select
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
      this.updatePreference('theme', (e.target as HTMLSelectElement).value);
    });

    // Split tunneling
    document.getElementById('split-mode-select')?.addEventListener('change', (e) => {
      this.updatePreference('splitTunneling', (e.target as HTMLSelectElement).value);
    });

    document.getElementById('add-domain-btn')?.addEventListener('click', () => {
      this.addDomain();
    });

    document.getElementById('add-banking-btn')?.addEventListener('click', () => {
      this.addBankingDomains();
    });

    // Passport
    document.getElementById('scan-passport-btn')?.addEventListener('click', () => {
      this.scanPassport();
    });

    // Profiles
    document.getElementById('create-profile-btn')?.addEventListener('click', () => {
      this.createProfile();
    });

    // Billing
    document.getElementById('upgrade-premium-btn')?.addEventListener('click', () => {
      this.upgradeTier('premium');
    });

    document.getElementById('upgrade-lifetime-btn')?.addEventListener('click', () => {
      this.upgradeTier('lifetime');
    });
  }

  private setupToggle(toggleId: string, preference: string): void {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const isActive = toggle.classList.contains('active');
      toggle.classList.toggle('active');
      this.updatePreference(preference, !isActive);
    });
  }

  private switchTab(tabName: string): void {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabName);
    });

    // Load tab-specific data
    if (tabName === 'split-tunnel') {
      this.renderDomainList();
    } else if (tabName === 'profiles') {
      this.renderProfiles();
    } else if (tabName === 'bookmarks') {
      this.renderBookmarks();
    }
  }

  private async updatePreference(key: string, value: any): Promise<void> {
    if (!this.profile) return;

    (this.profile.preferences as any)[key] = value;
    
    await this.sendMessage({
      type: 'UPDATE_PROFILE',
      updates: { preferences: this.profile.preferences }
    });
  }

  private async addDomain(): Promise<void> {
    const domainInput = document.getElementById('domain-input') as HTMLInputElement;
    const modeSelect = document.getElementById('domain-mode-select') as HTMLSelectElement;

    if (!domainInput || !modeSelect) return;

    const domain = domainInput.value.trim();
    const mode = modeSelect.value as 'vpn' | 'direct';

    if (domain) {
      await this.sendMessage({
        type: 'ADD_SPLIT_TUNNEL_DOMAIN',
        domain,
        mode
      });

      domainInput.value = '';
      await this.loadProfile();
      this.renderDomainList();
    }
  }

  private async addBankingDomains(): Promise<void> {
    await SplitTunneling.addBankingDomainsToBypass();
    await this.loadProfile();
    this.renderDomainList();
  }

  private renderDomainList(): void {
    const domainList = document.getElementById('domain-list');
    if (!domainList || !this.profile) return;

    const domains = this.profile.preferences.domains || [];

    if (domains.length === 0) {
      domainList.innerHTML = '<p style="color: #888; padding: 20px; text-align: center;">No custom domains added yet</p>';
      return;
    }

    domainList.innerHTML = domains.map(domain => `
      <div class="domain-item">
        <div>
          <span class="domain-name">${domain.domain}</span>
          <span class="domain-mode">${domain.mode.toUpperCase()}</span>
        </div>
        <button class="remove-btn" data-domain="${domain.domain}">Remove</button>
      </div>
    `).join('');

    // Add remove listeners
    domainList.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const domain = btn.getAttribute('data-domain');
        if (domain) {
          await this.sendMessage({
            type: 'REMOVE_SPLIT_TUNNEL_DOMAIN',
            domain
          });
          await this.loadProfile();
          this.renderDomainList();
        }
      });
    });
  }

  private async scanPassport(): Promise<void> {
    // In a real implementation, this would open QR scanner
    alert('QR Scanner feature coming soon! This will sync your home location settings from your phone.');
  }

  private async createProfile(): Promise<void> {
    const nameInput = document.getElementById('profile-name-input') as HTMLInputElement;
    if (!nameInput) return;

    const name = nameInput.value.trim();
    if (name) {
      // In a real implementation, this would open a profile creation dialog
      alert(`Profile "${name}" creation coming soon! You'll be able to save server combinations and settings.`);
      nameInput.value = '';
    }
  }

  private async renderProfiles(): Promise<void> {
    const response = await this.sendMessage({ type: 'GET_VPN_PROFILES' });
    const profiles = response.profiles || [];

    const profilesList = document.getElementById('profiles-list');
    if (!profilesList) return;

    if (profiles.length === 0) {
      profilesList.innerHTML = '<p style="color: #888; padding: 20px; text-align: center;">No profiles created yet</p>';
      return;
    }

    profilesList.innerHTML = profiles.map((profile: any) => `
      <div class="domain-item">
        <div class="domain-name">${profile.name}</div>
        <button class="remove-btn" data-profile-id="${profile.id}">Delete</button>
      </div>
    `).join('');
  }

  private async renderBookmarks(): Promise<void> {
    const response = await this.sendMessage({ type: 'GET_SECRET_BOOKMARKS' });
    const bookmarks = response.bookmarks || [];

    const bookmarksList = document.getElementById('bookmarks-list');
    if (!bookmarksList) return;

    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = '<p style="color: #888; padding: 20px; text-align: center;">No secret bookmarks yet. Right-click on any page and select "Add to Secret Bookmarks"</p>';
      return;
    }

    bookmarksList.innerHTML = bookmarks.map((bookmark: any) => `
      <div class="domain-item">
        <div>
          <div class="domain-name">${bookmark.title}</div>
          <div class="setting-desc">${bookmark.url}</div>
        </div>
        <button class="button secondary" onclick="window.open('${bookmark.url}')">Open</button>
      </div>
    `).join('');
  }

  private async upgradeTier(tier: 'premium' | 'lifetime'): Promise<void> {
    // In a real implementation, this would integrate with Stripe
    const confirmed = confirm(`Upgrade to ${tier} plan? This will redirect you to the payment page.`);
    
    if (confirmed) {
      await this.sendMessage({
        type: 'UPGRADE_TIER',
        tier
      });
      
      alert(`Welcome to ${tier}! Your account has been upgraded.`);
      await this.loadProfile();
      this.render();
    }
  }

  private render(): void {
    if (!this.profile) return;

    // Update toggles
    const autoConnectToggle = document.getElementById('auto-connect-toggle');
    const killSwitchToggle = document.getElementById('kill-switch-toggle');
    const smartDnsToggle = document.getElementById('smart-dns-toggle');
    const antiCaptchaToggle = document.getElementById('anti-captcha-toggle');

    if (autoConnectToggle) {
      autoConnectToggle.classList.toggle('active', this.profile.preferences.autoConnect);
    }
    if (killSwitchToggle) {
      killSwitchToggle.classList.toggle('active', this.profile.preferences.killSwitch);
    }
    if (smartDnsToggle) {
      smartDnsToggle.classList.toggle('active', this.profile.preferences.smartDNS);
    }
    if (antiCaptchaToggle) {
      antiCaptchaToggle.classList.toggle('active', this.profile.preferences.antiCaptcha);
    }

    // Update theme select
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
    if (themeSelect) {
      themeSelect.value = this.profile.preferences.theme;
    }

    // Update split mode select
    const splitModeSelect = document.getElementById('split-mode-select') as HTMLSelectElement;
    if (splitModeSelect) {
      splitModeSelect.value = this.profile.preferences.splitTunneling;
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

// Initialize options page
new OptionsPage();
