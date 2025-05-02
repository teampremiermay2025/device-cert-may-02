import { FanData, CompanyData } from '../hooks/Fan';

// Keep the original mockFanData for backward compatibility
export const mockFanData: FanData[] = [
  {
    FAN: 10002,
    FAN_NAME: 1002,
    CREATION_DATE: '2023-02-20',
    FAN_STATUS: 'Active',
    ACCOUNT_GROUP_ID: 'AG002',
    AG_NAME: 'Global Services',
    COMAPANY_ID: 'C002',
    COMPANY_NAME: 'Worldwide Systems Inc',
    REGION_NAME: 'Europe',
    CONTRACT: 'Business',
    CONTRACT_TYPE: 'Standard',
    LOCATION: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg',
  },
  {
    FAN: 10003,
    FAN_NAME: 1003,
    CREATION_DATE: '2023-03-10',
    FAN_STATUS: 'Pending',
    ACCOUNT_GROUP_ID: 'AG003',
    AG_NAME: 'Regional Operations',
    COMAPANY_ID: 'C003',
    COMPANY_NAME: 'Local Networks LLC',
    REGION_NAME: 'Asia Pacific',
    CONTRACT: 'Small Business',
    CONTRACT_TYPE: 'Basic',
    LOCATION: 'https://images.pexels.com/photos/5380675/pexels-photo-5380675.jpeg',
  },
  {
    FAN: 10004,
    FAN_NAME: 1004,
    CREATION_DATE: '2023-04-05',
    FAN_STATUS: 'Active',
    ACCOUNT_GROUP_ID: 'AG004',
    AG_NAME: 'Corporate Solutions',
    COMAPANY_ID: 'C004',
    COMPANY_NAME: 'Enterprise Dynamics',
    REGION_NAME: 'South America',
    CONTRACT: 'Enterprise',
    CONTRACT_TYPE: 'Premium',
    LOCATION: 'https://images.pexels.com/photos/5380685/pexels-photo-5380685.jpeg',
  },
  {
    FAN: 10005,
    FAN_NAME: 1005,
    CREATION_DATE: '2023-05-18',
    FAN_STATUS: 'Inactive',
    ACCOUNT_GROUP_ID: 'AG005',
    AG_NAME: 'Strategic Accounts',
    COMAPANY_ID: 'C005',
    COMPANY_NAME: 'Global Tech Partners',
    REGION_NAME: 'Middle East',
    CONTRACT: 'Enterprise',
    CONTRACT_TYPE: 'Custom',
    LOCATION: 'https://images.pexels.com/photos/5380693/pexels-photo-5380693.jpeg',
  },
  {
    FAN: 10006,
    FAN_NAME: 1006,
    CREATION_DATE: '2023-06-22',
    FAN_STATUS: 'Active',
    ACCOUNT_GROUP_ID: 'AG006',
    AG_NAME: 'Business Development',
    COMAPANY_ID: 'C006',
    COMPANY_NAME: 'Future Innovations Co',
    REGION_NAME: 'Africa',
    CONTRACT: 'Business',
    CONTRACT_TYPE: 'Premium',
    LOCATION: 'https://images.pexels.com/photos/5380701/pexels-photo-5380701.jpeg',
  },
  {
    FAN: 10007,
    FAN_NAME: 1007,
    CREATION_DATE: '2023-07-30',
    FAN_STATUS: 'Active',
    ACCOUNT_GROUP_ID: 'AG007',
    AG_NAME: 'Enterprise Accounts',
    COMAPANY_ID: 'C007',
    COMPANY_NAME: 'Global Tech Solutions',
    REGION_NAME: 'North America',
    CONTRACT: 'Enterprise',
    CONTRACT_TYPE: 'Standard',
    LOCATION: 'https://images.pexels.com/photos/5380712/pexels-photo-5380712.jpeg',
  },
  {
    FAN: 10008,
    FAN_NAME: 1008,
    CREATION_DATE: '2023-08-15',
    FAN_STATUS: 'Pending',
    ACCOUNT_GROUP_ID: 'AG008',
    AG_NAME: 'Regional Services',
    COMAPANY_ID: 'C008',
    COMPANY_NAME: 'Advanced Network Solutions',
    REGION_NAME: 'Europe',
    CONTRACT: 'Small Business',
    CONTRACT_TYPE: 'Basic',
    LOCATION: 'https://images.pexels.com/photos/5380721/pexels-photo-5380721.jpeg',
  },
  {
    FAN: 10009,
    FAN_NAME: 1009,
    CREATION_DATE: '2023-09-05',
    FAN_STATUS: 'Active',
    ACCOUNT_GROUP_ID: 'AG009',
    AG_NAME: 'Corporate Accounts',
    COMAPANY_ID: 'C009',
    COMPANY_NAME: 'Prime Tech Industries',
    REGION_NAME: 'Asia Pacific',
    CONTRACT: 'Enterprise',
    CONTRACT_TYPE: 'Premium',
    LOCATION: 'https://images.pexels.com/photos/5380734/pexels-photo-5380734.jpeg',
  },
  {
    FAN: 10010,
    FAN_NAME: 1010,
    CREATION_DATE: '2023-10-18',
    FAN_STATUS: 'Active',
    ACCOUNT_GROUP_ID: 'AG010',
    AG_NAME: 'Strategic Partnerships',
    COMAPANY_ID: 'C010',
    COMPANY_NAME: 'Innovative Solutions Group',
    REGION_NAME: 'South America',
    CONTRACT: 'Business',
    CONTRACT_TYPE: 'Custom',
    LOCATION: 'https://images.pexels.com/photos/5380744/pexels-photo-5380744.jpeg',
  }
];

// For image selection
export const companyImages: Record<string, string> = {
  "COMP-001": "https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg",
  "COMP-002": "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg",
  "COMP-003": "https://images.pexels.com/photos/218717/pexels-photo-218717.jpeg",
  "COMP-004": "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg",
  "COMP-005": "https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg",
  "COMP-006": "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg",
  "COMP-007": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg",
  "COMP-008": "https://images.pexels.com/photos/1337753/pexels-photo-1337753.jpeg",
  "COMP-009": "https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg",
  "COMP-010": "https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg",
  "COMP-011": "https://images.pexels.com/photos/935979/pexels-photo-935979.jpeg",
  "COMP-012": "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
  "COMP-013": "https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg",
  "COMP-014": "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
  "COMP-015": "https://images.pexels.com/photos/3861943/pexels-photo-3861943.jpeg",
  "COMP-016": "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
  "COMP-017": "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
  "COMP-018": "https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg",
  "COMP-019": "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg",
  "COMP-020": "https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg",
  "COMP-021": "https://images.pexels.com/photos/306763/pexels-photo-306763.jpeg",
  "COMP-022": "https://images.pexels.com/photos/1034665/pexels-photo-1034665.jpeg",
  "COMP-023": "https://images.pexels.com/photos/3912954/pexels-photo-3912954.jpeg",
  "COMP-024": "https://images.pexels.com/photos/158826/structure-light-led-movement-158826.jpeg",
  "COMP-025": "https://images.pexels.com/photos/3912399/pexels-photo-3912399.jpeg",
  "COMP-026": "https://images.pexels.com/photos/5946045/pexels-photo-5946045.jpeg",
  "COMP-027": "https://images.pexels.com/photos/821749/pexels-photo-821749.jpeg",
  "COMP-028": "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg",
  "COMP-029": "https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg",
  "COMP-030": "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg",
  "COMP-031": "https://images.pexels.com/photos/3612932/pexels-photo-3612932.jpeg",
  "COMP-032": "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg",
  "COMP-033": "https://images.pexels.com/photos/45111/pexels-photo-45111.jpeg",
  "COMP-034": "https://images.pexels.com/photos/5816286/pexels-photo-5816286.jpeg",
  "COMP-035": "https://images.pexels.com/photos/3170635/pexels-photo-3170635.jpeg",
  "COMP-036": "https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg",
  "COMP-037": "https://images.pexels.com/photos/887751/pexels-photo-887751.jpeg",
  "COMP-038": "https://images.pexels.com/photos/3913025/pexels-photo-3913025.jpeg",
  "COMP-039": "https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg",
  "COMP-040": "https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg",
  "COMP-041": "https://images.pexels.com/photos/3205568/pexels-photo-3205568.jpeg",
  "COMP-042": "https://images.pexels.com/photos/207589/pexels-photo-207589.jpeg",
  "COMP-043": "https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg",
  "COMP-044": "https://images.pexels.com/photos/4050318/pexels-photo-4050318.jpeg",
  "COMP-045": "https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg",
  "COMP-046": "https://images.pexels.com/photos/5980743/pexels-photo-5980743.jpeg",
  "COMP-047": "https://images.pexels.com/photos/2399840/pexels-photo-2399840.jpeg",
  "COMP-048": "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg",
  "COMP-049": "https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg",
  "COMP-050": "https://images.pexels.com/photos/1476321/pexels-photo-1476321.jpeg"
};

// Flag emoji mapping
export const getFlagEmoji = (countryName: string): string => {
  const flagMap: Record<string, string> = {
    'USA': '🇺🇸',
    'South Korea': '🇰🇷',
    'Germany': '🇩🇪',
    'Japan': '🇯🇵',
    'France': '🇫🇷',
    'China': '🇨🇳',
    'Taiwan': '🇹🇼',
    'UK': '🇬🇧',
    'Netherlands': '🇳🇱',
    'Canada': '🇨🇦',
    'Finland': '🇫🇮'
  };
  
  return flagMap[countryName] || '🌐';
};

// Function to get a device type icon (for UI enhancement)
export const getDeviceTypeIcon = (deviceType: string): string => {
  switch (deviceType.toLowerCase()) {
    case 'smartphone':
      return 'smartphone';
    case 'tablet':
      return 'tablet';
    case 'laptop':
      return 'laptop';
    case 'smart tv':
      return 'tv';
    case 'smart thermostat':
      return 'thermometer';
    case 'smart water sensor':
      return 'droplets';
    case 'smart camera':
      return 'camera';
    case 'smart traffic light':
      return 'traffic-cone';
    case 'smart parking sensor':
      return 'parking-circle';
    case 'smart heart monitor':
      return 'heart-pulse';
    case 'smart insulin pump':
      return 'syringe';
    case 'smart router':
      return 'wifi';
    case 'smart access point':
      return 'access-point';
    case 'smart plug':
      return 'plug';
    case 'smart lock':
      return 'lock';
    case 'smart doorbell':
      return 'bell';
    case 'fitness tracker':
      return 'activity';
    case 'smartwatch':
      return 'watch';
    case 'sleep tracker':
      return 'moon';
    case 'smart ring':
      return 'circle';
    case 'smart weather station':
      return 'cloud';
    case 'smart speaker':
      return 'speaker';
    case 'single board computer':
      return 'cpu';
    case 'smart meter':
      return 'gauge';
    default:
      return 'device-2';
  }
};

// Mock company data
export const mockCompanyData: CompanyData[] = [
  {
    "company_id": "COMP-001",
    "company_name": "Apple",
    "flag": "USA",
    "undergoing_active_release": "No",
    "active_releases": {
      "DA-IR": ["1.0"],
      "DA-MR": []
    },
    "devices": [
      {
        "device_id": "DARP-1",
        "device_name": "iPhone 16",
        "device_type": "Smartphone",
        "device_code_name": "Code-iPhone-16"
      },
      {
        "device_id": "DARP-123",
        "device_name": "MacBook Pro 2025",
        "device_type": "Laptop",
        "device_code_name": "Code-MacBook-Pro-2025"
      }
    ],
    "pending_registrations": 2,
    "expired_ndas": 1
  },
  {
    "company_id": "COMP-002",
    "company_name": "Samsung",
    "flag": "South Korea",
    "undergoing_active_release": "Yes",
    "active_releases": {
      "DA-IR": ["1.1"],
      "DA-MR": ["2.0", "2.1"]
    },
    "devices": [
      {
        "device_id": "DARP-30",
        "device_name": "Galaxy S25",
        "device_type": "Smartphone",
        "device_code_name": "Code-Galaxy-S25"
      },
      {
        "device_id": "DARP-32",
        "device_name": "Galaxy Tab S9",
        "device_type": "Tablet",
        "device_code_name": "Code-Galaxy-Tab-S9"
      }
    ],
    "pending_registrations": 5,
    "expired_ndas": 0
  },
  {
    "company_id": "COMP-003",
    "company_name": "Google",
    "flag": "USA",
    "undergoing_active_release": "No",
    "active_releases": {
      "DA-IR": ["1.0"],
      "DA-MR": []
    },
    "devices": [
      {
        "device_id": "DARP-40",
        "device_name": "Pixel 9",
        "device_type": "Smartphone",
        "device_code_name": "Code-Pixel-9"
      },
      {
        "device_id": "DARP-41",
        "device_name": "Pixel Tablet 2",
        "device_type": "Tablet",
        "device_code_name": "Code-Pixel-Tablet-2"
      }
    ],
    "pending_registrations": 1,
    "expired_ndas": 2
  },
  {
    "company_id": "COMP-004",
    "company_name": "IoT-HomeTech",
    "flag": "Germany",
    "undergoing_active_release": "Yes",
    "active_releases": {
      "DA-IR": ["3.0"],
      "DA-MR": ["3.1", "3.2"]
    },
    "devices": [
      {
        "device_id": "IOT-100",
        "device_name": "IoT-Thermostat-5000",
        "device_type": "Smart Thermostat",
        "device_code_name": "Code-IoT-Thermostat-5000"
      },
      {
        "device_id": "IOT-101",
        "device_name": "IoT-WaterSense-3000",
        "device_type": "Smart Water Sensor",
        "device_code_name": "Code-IoT-WaterSense-3000"
      }
    ],
    "pending_registrations": 3,
    "expired_ndas": 1
  },
  {
    "company_id": "COMP-005",
    "company_name": "SmartCityCorp",
    "flag": "Japan",
    "undergoing_active_release": "No",
    "active_releases": {
      "DA-IR": ["2.0"],
      "DA-MR": []
    },
    "devices": [
      {
        "device_id": "IOT-200",
        "device_name": "CityLight-4000",
        "device_type": "Smart Traffic Light",
        "device_code_name": "Code-CityLight-4000"
      },
      {
        "device_id": "IOT-201",
        "device_name": "ParkSense-2000",
        "device_type": "Smart Parking Sensor",
        "device_code_name": "Code-ParkSense-2000"
      }
    ],
    "pending_registrations": 0,
    "expired_ndas": 3
  },
  {
    "company_id": "COMP-006",
    "company_name": "HealthTechIoT",
    "flag": "France",
    "undergoing_active_release": "Yes",
    "active_releases": {
      "DA-IR": ["1.0"],
      "DA-MR": ["1.1"]
    },
    "devices": [
      {
        "device_id": "IOT-300",
        "device_name": "HeartBeat-6000",
        "device_type": "Smart Heart Monitor",
        "device_code_name": "Code-HeartBeat-6000"
      },
      {
        "device_id": "IOT-301",
        "device_name": "InsulinFlow-1000",
        "device_type": "Smart Insulin Pump",
        "device_code_name": "Code-InsulinFlow-1000"
      }
    ],
    "pending_registrations": 4,
    "expired_ndas": 0
  },
  {
    "company_id": "COMP-007",
    "company_name": "Huawei",
    "flag": "China",
    "undergoing_active_release": "No",
    "active_releases": {
      "DA-IR": ["1.0"],
      "DA-MR": []
    },
    "devices": [
      {
        "device_id": "DARP-50",
        "device_name": "Mate 60",
        "device_type": "Smartphone",
        "device_code_name": "Code-Mate-60"
      },
      {
        "device_id": "DARP-51",
        "device_name": "MatePad Pro",
        "device_type": "Tablet",
        "device_code_name": "Code-MatePad-Pro"
      }
    ],
    "pending_registrations": 6,
    "expired_ndas": 2
  },
  {
    "company_id": "COMP-008",
    "company_name": "Sony",
    "flag": "Japan",
    "undergoing_active_release": "Yes",
    "active_releases": {
      "DA-IR": ["2.0"],
      "DA-MR": ["2.1"]
    },
    "devices": [
      {
        "device_id": "DARP-60",
        "device_name": "Xperia 1 VI",
        "device_type": "Smartphone",
        "device_code_name": "Code-Xperia-1-VI"
      },
      {
        "device_id": "DARP-61",
        "device_name": "Bravia XR",
        "device_type": "Smart TV",
        "device_code_name": "Code-Bravia-XR"
      }
    ],
    "pending_registrations": 1,
    "expired_ndas": 1
  },
  {
    "company_id": "COMP-009",
    "company_name": "LG",
    "flag": "South Korea",
    "undergoing_active_release": "No",
    "active_releases": {
      "DA-IR": ["1.0"],
      "DA-MR": []
    },
    "devices": [
      {
        "device_id": "DARP-70",
        "device_name": "LG V70",
        "device_type": "Smartphone",
        "device_code_name": "Code-LG-V70"
      },
      {
        "device_id": "DARP-71",
        "device_name": "LG OLED 2025",
        "device_type": "Smart TV",
        "device_code_name": "Code-LG-OLED-2025"
      }
    ],
    "pending_registrations": 0,
    "expired_ndas": 4
  },
  {
    "company_id": "COMP-010",
    "company_name": "Xiaomi",
    "flag": "China",
    "undergoing_active_release": "Yes",
    "active_releases": {
      "DA-IR": ["1.1"],
      "DA-MR": ["1.2"]
    },
    "devices": [
      {
        "device_id": "DARP-80",
        "device_name": "Mi 15",
        "device_type": "Smartphone",
        "device_code_name": "Code-Mi-15"
      },
      {
        "device_id": "DARP-81",
        "device_name": "Mi Pad 6",
        "device_type": "Tablet",
        "device_code_name": "Code-Mi-Pad-6"
      }
    ],
    "pending_registrations": 7,
    "expired_ndas": 0
  }
];