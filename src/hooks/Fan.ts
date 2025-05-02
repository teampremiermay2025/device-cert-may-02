export interface Device {
    device_id: string;
    device_name: string;
    device_type: string;
    device_code_name: string;
  }
  
  export interface ActiveReleases {
    "DA-IR": string[];
    "DA-MR": string[];
  }
  
  export interface CompanyData {
    company_id: string;
    company_name: string;
    flag: string;
    undergoing_active_release: string;
    active_releases: ActiveReleases;
    devices: Device[];
    pending_registrations: number;
    expired_ndas: number;
  }
  
  // Keep the original FanData interface for backward compatibility
  export interface FanData {
    FAN?: number;
    FAN_NAME?: number;
    CREATION_DATE?: string;
    FAN_STATUS?: string;
    BUILT_BY?: string;
    ACCOUNT_GROUP_ID?: string;
    AG_NAME?: string;
    COMAPANY_ID?: string;
    COMPANY_NAME?: string;
    ENTERPRISE_ID?: string;
    ENTERPRISE_NAME?: string;
    ROME_COMPANY_NAME?: string;
    BILL_DESCRIPTION?: string;
    FN_INDICATOR?: boolean;
    CONNECTED_CAR?: boolean;
    GEOTAB?: boolean;
    CONTRACT?: string;
    CONTRACT_TYPE?: string;
    REGION_NAME?: string;
    LOCATION?: string;
    FORMAT?: string;
  }