export interface VPNServer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  ip: string;
  port: number;
  ping: number;
  load: number;
  protocol: 'wireguard' | 'shadowsocks';
  features: string[];
}

export interface VPNConnection {
  connected: boolean;
  server: VPNServer | null;
  bytesIn: number;
  bytesOut: number;
  connectedAt: number | null;
  protocol: 'wireguard' | 'shadowsocks' | 'smartdns';
}

export interface UserProfile {
  id: string;
  tier: 'free' | 'premium' | 'lifetime';
  dataLimit: number;
  dataUsed: number;
  passport?: UserPassport;
  preferences: UserPreferences;
}

export interface UserPassport {
  country: string;
  timezone: string;
  language: string;
  subscriptions: string[];
  geolocation: {
    lat: number;
    lon: number;
  };
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  autoConnect: boolean;
  killSwitch: boolean;
  splitTunneling: SplitTunnelMode;
  domains: DomainRule[];
  smartDNS: boolean;
  antiCaptcha: boolean;
}

export type SplitTunnelMode = 'all-vpn' | 'all-direct' | 'custom';

export interface DomainRule {
  domain: string;
  mode: 'vpn' | 'direct';
  smartDNS?: boolean;
}

export interface VPNProfile {
  id: string;
  name: string;
  serverId: string;
  doubleHop?: string; // secondary server id
  icon?: string;
}

export interface SecretBookmark {
  id: string;
  url: string;
  title: string;
  createdAt: number;
}

export interface ConnectionStats {
  totalData: number;
  trackersBlocked: number;
  captchasSolved: number;
  connectionTime: number;
  serverSwitches: number;
}

export interface WireGuardConfig {
  privateKey: string;
  publicKey: string;
  address: string;
  dns: string[];
  serverPublicKey: string;
  serverEndpoint: string;
  allowedIPs: string[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
