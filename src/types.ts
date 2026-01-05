
export interface DeviceGroup {
  id: string;
  name: string;
  count?: number; // Optional for devices
  type?: 'group' | 'device'; // Distinguish between folders and devices
  status?: 'online' | 'offline' | 'warning'; // For devices
  children?: DeviceGroup[];
}

export interface NetworkInterface {
  id: string;
  name: string;
  status: 'up' | 'down' | 'unplugged';
  isWan: boolean;
  category: 'physical' | 'sub' | 'vlan' | 'aggregate' | 'loopback' | 'tunnel'; // New field for filtering
  type: 'L3' | 'L2' | 'Virtual Wire' | 'Aggregate' | '-';
  zone: string;
  virtualSystem: string;
  connectionType: string;
  ip: string;
  gateway?: string; // Add gateway field
  mode: string;
  mtu: string;
  vlanId?: string; // For Sub/VLAN
  parentInterface?: string; // For Sub
  memberInterfaces?: string[]; // For Aggregate
  workMode?: string; // For Aggregate
  sourceInOut?: boolean; // New field
  // DHCP specific fields
  dhcpDefaultRoute?: boolean;
  dhcpCommunicationMode?: 'unicast' | 'broadcast';
  dhcpSystemDns?: boolean;
  // Which template defines this interface?
  sourceTemplateId: string;
  // Which devices use this specific config?
  associatedDevices?: string[];
}

export interface NetworkZone {
  id: string;
  name: string;
  type: 'L3' | 'L2' | 'Virtual Wire';
  interfaces: string[];
}

export interface VirtualWire {
  id: string;
  name: string;
  interface1: string;
  interface2: string;
  description?: string;
}

export interface VirtualLine {
  id: string;
  name: string;
  outboundInterface: string;
  uplink: string;
  downlink: string;
}

export interface DhcpConfig {
  id: string;
  name: string;
  status: 'enabled' | 'disabled';
  description?: string;
  interface: string;
  type: 'Server' | 'Relay';
  ipRange?: string; // Supports variable
  netmask?: string;
  gateway?: string; // Supports variable
  dnsType: 'system' | 'custom';
  primaryDns?: string; // Supports variable
  secondaryDns?: string; // Supports variable
  leaseTime?: number;
}

export interface DnsConfig {
  // Basic DNS
  primaryDns: string;
  secondaryDns?: string;
  
  // Transparent Proxy
  proxyExternalPrimary?: string;
  proxyExternalSecondary?: string;
  proxyInternalPrimary?: string;
  proxyInternalSecondary?: string;
  enableProxy: boolean;
  enableDns64: boolean;
  dns64Prefix?: string;
  domainFileList?: string;
}

export interface DdnsPolicy {
  id: string;
  name: string;
  status: 'enabled' | 'disabled';
  description?: string;
  provider: string;
  domain: string;
  username?: string;
  password?: string;
  interface: string;
  updateInterval: number; // hours
  retryInterval: number; // minutes
  lastUpdateResult?: string;
  lastUpdateTime?: string;
}

export interface TemplateVariable {
  name: string; // Must start with $
  type: 'IP Netmask' | 'IP Range' | 'IP Wildcard' | 'FQDN' | 'Group ID' | 'Interface';
  defaultValue?: string;
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type?: string; // Simplified, no longer strictly 'base' | 'overlay'
  icon?: string;
  deviceCount?: number;
  modules?: string[]; // List of enabled module IDs
  variables?: TemplateVariable[]; // Variables defined in this template
}

export interface VariableMapping {
  variable: string; // e.g., $interface_ip
  description?: string;
  value?: string; // The specific value for this stack context
  deviceValues: Record<string, string>; // deviceId -> specific value overrides
}

export interface TemplateStack {
  id: string;
  name: string;
  description: string;
  templates: Template[]; // Ordered list, last one wins (Higher Priority)
  assignedDeviceGroups: string[];
  variableMappings?: VariableMapping[]; // Store variable values here
}

export interface PolicyRule {
  id: string;
  priority: number;
  name: string;
  tags?: string[];
  sourceType: 'shared' | 'group' | 'local'; // where the rule comes from
  sourceZone: string;
  sourceAddress: string;
  user?: string;
  destinationZone: string;
  destinationAddress: string;
  application: string;
  service: string;
  effectiveTime?: string;
  action: 'allow' | 'deny';
  status: 'enabled' | 'disabled';
  hitCount?: number;
}

export interface NetworkObject {
  id: string;
  name: string;
  sourceType: 'shared' | 'group' | 'local';
  type: 'ip' | 'range' | 'fqdn';
  content: string;
}

export interface StaticRoute {
  id: string;
  ipVersion: 'IPv4' | 'IPv6';
  destination: string; // Supports variable
  interface: string;
  nextHop?: string; // Supports variable
  distance: number;
  metric: number;
  status: 'enabled' | 'disabled';
  description?: string;
  reliabilityDetection?: boolean;
  sourceTemplateId: string;
}

export interface BgpGlobalConfig {
  enabled: boolean;
  asNumber?: string;
  routerId?: string;
}

export interface BgpNetwork {
  id: string;
  network: string; // Supports variable
  sourceTemplateId: string;
}

export type ViewMode = 'list' | 'stack_edit';
