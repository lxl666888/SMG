
import { DeviceGroup, NetworkInterface, Template, TemplateStack, PolicyRule, NetworkObject, NetworkZone, VirtualWire, VirtualLine, DnsConfig, DdnsPolicy, DhcpConfig, StaticRoute, BgpGlobalConfig, BgpNetwork } from './types';

export const MOCK_DEVICE_GROUPS: DeviceGroup[] = [
  {
    id: 'root',
    name: '所有设备', 
    count: 3,
    type: 'group',
    children: [
      { id: 'ungrouped', name: '未归类组', count: 0, type: 'group' },
      {
        id: 'guangdong',
        name: '广东省区域',
        count: 6,
        type: 'group',
        children: [
          { 
            id: 'guangzhou', 
            name: '广州办事处', 
            count: 5,
            type: 'group',
            children: [
               {
                id: 'gz-core-group',
                name: '广州核心防火墙组',
                type: 'group',
                count: 2,
                children: [
                    { id: 'dev-gz-core-01', name: '广州核心防火墙-01', type: 'device', status: 'online' },
                    { id: 'dev-gz-core-02', name: '广州核心防火墙-02', type: 'device', status: 'online' },
                ]
              },
              {
                id: 'gz-edge-group',
                name: '广州边界防火墙组',
                type: 'group',
                count: 3,
                children: [
                    { id: 'dev-gz-edge-01', name: '广州边界防火墙-01', type: 'device', status: 'online' },
                    { id: 'dev-gz-edge-02', name: '广州边界防火墙-02', type: 'device', status: 'warning' },
                    { id: 'dev-gz-edge-03', name: '广州边界防火墙-03', type: 'device', status: 'online' },
                ]
              }
            ]
          },
          { 
            id: 'shenzhen', 
            name: '深圳分公司', 
            count: 1,
            type: 'group',
            children: [
               { id: 'dev-sz-main', name: '深圳主防火墙', type: 'device', status: 'online' }
            ]
          },
        ]
      },
      {
        id: 'northeast',
        name: '东北区域',
        count: 1,
        type: 'group',
        children: [
          { id: 'harbin', name: '哈尔滨分支防火墙-01', type: 'device', status: 'offline' }
        ]
      }
    ]
  }
];

// Aggregated list for Sub-template Management - Empty by default
export const MOCK_TEMPLATES: Template[] = [];

// Initialize with EMPTY stacks
export const MOCK_STACKS: TemplateStack[] = [];

// Interface Data
export const MOCK_INTERFACES: NetworkInterface[] = [
  {
    id: 'eth1',
    name: 'eth1',
    status: 'up',
    isWan: false,
    category: 'physical',
    type: 'L3',
    zone: 'DMZ_Local',
    virtualSystem: 'vsys1',
    connectionType: 'Static',
    ip: '172.16.1.1/24',
    mode: 'Full 1000Mbps',
    mtu: '1500',
    sourceTemplateId: 'local'
  },
  {
    id: 'eth2',
    name: 'eth2',
    status: 'up',
    isWan: false,
    category: 'physical',
    type: 'Virtual Wire',
    zone: 'VW_Zone',
    virtualSystem: 'vsys1',
    connectionType: '-',
    ip: '-',
    mode: 'Auto',
    mtu: '1500',
    sourceTemplateId: 'local'
  },
  {
    id: 'eth3',
    name: 'eth3',
    status: 'up',
    isWan: false,
    category: 'physical',
    type: 'Virtual Wire',
    zone: 'VW_Zone',
    virtualSystem: 'vsys1',
    connectionType: '-',
    ip: '-',
    mode: 'Auto',
    mtu: '1500',
    sourceTemplateId: 'local'
  },
  {
    id: 'eth5',
    name: 'eth5',
    status: 'down',
    isWan: false,
    category: 'physical',
    type: 'L3',
    zone: 'Guest_WiFi',
    virtualSystem: 'vsys1',
    connectionType: 'DHCP',
    ip: '192.168.50.1/24',
    mode: 'Auto',
    mtu: '1500',
    sourceTemplateId: 'local'
  },
  {
    id: 'eth1.10',
    name: 'eth1.10',
    status: 'up',
    isWan: false,
    category: 'sub',
    type: 'L3',
    zone: 'VLAN_10',
    virtualSystem: 'vsys1',
    connectionType: 'Static',
    ip: '10.10.10.1/24',
    mode: 'Auto',
    mtu: '1500',
    vlanId: '10',
    parentInterface: 'eth1',
    sourceTemplateId: 'local'
  },
  {
    id: 'veth.100',
    name: 'veth.100',
    status: 'up',
    isWan: false,
    category: 'vlan',
    type: 'L3',
    zone: 'VLAN_100',
    virtualSystem: 'vsys1',
    connectionType: 'Static',
    ip: '192.168.100.1/24',
    mode: '-',
    mtu: '1500',
    vlanId: '100',
    sourceTemplateId: 'local'
  }
];

export const MOCK_ZONES: NetworkZone[] = [
    { id: 'z1', name: 'Trust', type: 'L3', interfaces: ['eth2', 'eth3'] },
    { id: 'z2', name: 'Untrust', type: 'L3', interfaces: ['eth0'] },
    { id: 'z3', name: 'DMZ', type: 'L3', interfaces: ['eth1'] },
    { id: 'z4', name: 'L2_Zone', type: 'L2', interfaces: ['eth4', 'eth5'] },
];

export const MOCK_VIRTUAL_WIRES: VirtualWire[] = [
    { id: 'vw1', name: 'VW_Pair_1', interface1: 'eth2', interface2: 'eth3', description: 'Internal transparent bridge' }
];

export const MOCK_VIRTUAL_LINES: VirtualLine[] = [
    { id: 'vl1', name: 'Internet_Line', outboundInterface: 'eth1', uplink: '100 Mbps', downlink: '200 Mbps' }
];

export const MOCK_DNS_CONFIG: DnsConfig = {
  primaryDns: '8.8.8.8',
  secondaryDns: '114.114.114.114',
  proxyExternalPrimary: '114.114.114.114',
  enableProxy: false,
  enableDns64: false,
  dns64Prefix: '64:ff9b::/96'
};

export const MOCK_DDNS_POLICIES: DdnsPolicy[] = [
    {
        id: 'ddns-1',
        name: '总部动态域名',
        status: 'enabled',
        description: '主线路动态IP更新',
        provider: 'DynDNS',
        domain: 'hq.example.com',
        username: 'admin',
        interface: 'eth1',
        updateInterval: 24,
        retryInterval: 10,
        lastUpdateResult: '更新成功',
        lastUpdateTime: '2023-10-27 10:00:00'
    }
];

export const MOCK_DHCP_CONFIGS: DhcpConfig[] = [
    {
        id: 'dhcp-1',
        name: 'Guest_WIFI_DHCP',
        status: 'enabled',
        interface: 'eth5',
        type: 'Server',
        ipRange: '192.168.50.100 - 192.168.50.200',
        netmask: '255.255.255.0',
        gateway: '192.168.50.1',
        dnsType: 'system',
        leaseTime: 1440
    }
];

export const MOCK_STATIC_ROUTES: StaticRoute[] = [
  { 
    id: 'route-1', 
    ipVersion: 'IPv4', 
    destination: '0.0.0.0/0', 
    interface: 'eth1', 
    nextHop: '192.168.1.1', 
    distance: 1, 
    metric: 0, 
    status: 'enabled', 
    description: 'Default Gateway',
    sourceTemplateId: 'local'
  }
];

export const MOCK_BGP_CONFIG: BgpGlobalConfig = {
  enabled: true,
  asNumber: '65001',
  routerId: '10.0.0.1'
};

export const MOCK_BGP_NETWORKS: BgpNetwork[] = [
  { id: 'bgp-net-1', network: '192.168.10.0/24', sourceTemplateId: 'local' }
];

export const MOCK_PRE_RULES: PolicyRule[] = [
  {
    id: 'rule-1',
    priority: 1,
    name: '允许Web出站',
    tags: ['办公网'],
    sourceType: 'shared',
    sourceZone: 'Trust',
    sourceAddress: '192.168.1.0/24',
    user: 'Any',
    destinationZone: 'Untrust',
    destinationAddress: 'Any',
    application: 'Web Browsing',
    service: 'HTTP/HTTPS',
    effectiveTime: 'Always',
    action: 'allow',
    status: 'enabled',
    hitCount: 12503
  },
  {
    id: 'rule-2',
    priority: 2,
    name: '阻断P2P下载',
    tags: ['安全合规'],
    sourceType: 'group',
    sourceZone: 'Trust',
    sourceAddress: 'Any',
    user: 'Any',
    destinationZone: 'Untrust',
    destinationAddress: 'Any',
    application: 'BitTorrent',
    service: 'Any',
    effectiveTime: 'Always',
    action: 'deny',
    status: 'enabled',
    hitCount: 42
  }
];

export const MOCK_POST_RULES: PolicyRule[] = [
    {
    id: 'rule-99',
    priority: 99,
    name: '默认拒绝',
    tags: ['系统默认'],
    sourceType: 'shared',
    sourceZone: 'Any',
    sourceAddress: 'Any',
    user: 'Any',
    destinationZone: 'Any',
    destinationAddress: 'Any',
    application: 'Any',
    service: 'Any',
    effectiveTime: 'Always',
    action: 'deny',
    status: 'enabled',
    hitCount: 0
  }
];

export const MOCK_NETWORK_OBJECTS: NetworkObject[] = [
  {
    id: 'obj-1',
    name: 'All',
    sourceType: 'shared',
    type: 'ip',
    content: '0.0.0.0/0'
  },
  {
    id: 'obj-2',
    name: 'Local_Subnet',
    sourceType: 'local',
    type: 'range',
    content: '192.168.1.0/24'
  }
];
