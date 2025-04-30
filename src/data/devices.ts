import devices from './devices.json';

export interface DeviceItem {
  "Device Issue Key": string;
  "Device Vendor": string;
  "Device Type": string;
  "Device Model": string;
  "Device Marketing Name": string;
  "Device Code Name": string;
  "Device OS": string;
  "Device OS Version": string;
  "Device Hardware Version": string;
  "Device Payment Type": string;
  "Device Channel": string;
  "Type": string; // "IoT" or "Non-IoT"
}

export const getDevicesByType = () => {
  const iot: DeviceItem[] = [];
  const nonIot: DeviceItem[] = [];
  (devices as DeviceItem[]).forEach(d => {
    if (d.Type === 'IoT') iot.push(d);
    else nonIot.push(d);
  });
  return { iot, nonIot };
};

export const getAllDevices = (): DeviceItem[] => devices as DeviceItem[];
