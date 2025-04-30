// This script loads initial data into localStorage only if it does not already exist.
// Place your JSON data files in this folder or import them as needed.

// Example: import certificationsData from './data/certifications.json';
// import workflowsData from './data/workflows.json';
// import dashboardsData from './data/dashboards.json';

// You can import as many as you want and add to the DATA_TO_LOAD array.
import userData from './data/users.json';
const DATA_TO_LOAD = [
  {
    key: 'certifications',
    data: [], // Replace with imported certificationsData
  },
  {
    key: 'workflows',
    data: [{"id":"a1071492-87f7-4658-8c43-613547338526","darpKey":"DARP 1","projectName":"Smoke Test: ST0919A","type":"DA IR","status":"FORECAST","targetDate":"","softwareVersion":"1.0.0","lastUpdated":"2025-04-30T13:26:32.958Z","tasks":[{"id":"46e383af-0f84-4ec0-98e6-6f5f0707ca74","name":"SYSTEM USE","description":" ALL CHAPTERS","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"},{"id":"2ffa06d6-566f-403a-9cfc-383fab819137","name":"SYSTEM RELEASE","description":" ALL CHAPTERS","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"},{"id":"0ab4ca81-4c50-4ffa-aa1a-e31edd07124c","name":"Testing","description":" Monitoring Summary","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"},{"id":"9bb59a33-0cb5-40db-9118-c907a121d3bd","name":"Testing","description":" Closure Summary","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"}],"issues":[],"workflow":"5dd76a68-63fa-4bb3-ae9e-54c60b059dd5","assignee":"","vendor":"Xiaomi","deviceType":"Smartphone","deviceModel":"XM-12P","deviceMarketingName":"Xiaomi 12 Pro","deviceCodeName":"Zeus","deviceOS":"Android","deviceOSVersion":"12","deviceHardwareVersion":"1.0","devicePaymentType":"Post-Paid","deviceChannel":"CRICKET IETA","securityLevel":"","reporter":"","primaryPC":"","vendorProjectLead":"","createdAt":"2025-04-30T13:26:32.958Z","updatedAt":"2025-04-30T13:26:32.958Z","forecastedDEDate":"2025-05-16","forecastedFFWDate":"2025-05-30","forecastedTADate":"2025-05-30","forecastedLaunchDate":"2025-05-30","components":"","affectsVersion":"1.0.0","resolution":""},{"id":"331b4ea0-f194-4f58-95de-7aee4688b008","darpKey":"DARP 2","projectName":"Smoke Test: ST0919A","type":"DA IR","status":"FORECAST","targetDate":"","softwareVersion":"","lastUpdated":"2025-04-30T13:48:38.818Z","tasks":[{"id":"09a77feb-8766-4407-987e-a10d98681cc0","name":"SYSTEM USE","description":" ALL CHAPTERS","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"},{"id":"cff9fd2a-c026-461c-b567-113c013ff867","name":"SYSTEM RELEASE","description":" ALL CHAPTERS","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"},{"id":"9069cd2b-009f-4b5a-a79f-6ed4034fea62","name":"Testing","description":" Monitoring Summary","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"},{"id":"38e823bf-7578-47b5-b915-2cf67b03d93d","name":"Testing","description":" Closure Summary","status":"TODO","isChecked":false,"priority":"MEDIUM","attachments":[],"comments":[],"labels":[],"stage":"FORECAST"}],"issues":[],"workflow":"5dd76a68-63fa-4bb3-ae9e-54c60b059dd5","assignee":"","vendor":"Xiaomi","deviceType":"Smartphone","deviceModel":"XM-12P","deviceMarketingName":"Xiaomi 12 Pro","deviceCodeName":"Zeus","deviceOS":"Android","deviceOSVersion":"12","deviceHardwareVersion":"1.0","devicePaymentType":"Post-Paid","deviceChannel":"CRICKET IETA","securityLevel":"","reporter":"","primaryPC":"","vendorProjectLead":"","createdAt":"2025-04-30T13:48:38.818Z","updatedAt":"2025-04-30T13:48:38.818Z","forecastedDEDate":"2025-05-15","forecastedFFWDate":"2025-05-30","forecastedTADate":"2025-05-30","forecastedLaunchDate":"2025-05-30","components":"","affectsVersion":"","resolution":""}], // Replace with imported workflowsData
  },
  {
    key: 'dashboards',
    data: [{"id":"main-dashboard","title":"Main Dashboard","description":"Device Certification Dashboard","type":"default","sharedWith":[],"layout":[],"createdAt":"2025-04-25T17:08:53.690Z","updatedAt":"2025-04-25T17:08:53.690Z","createdBy":"system"},{"id":"waiver-dashboard","title":"Waiver Request","description":"Manage waiver requests and approvals","type":"default","sharedWith":[],"layout":[],"createdAt":"2025-04-25T17:08:53.690Z","updatedAt":"2025-04-25T17:08:53.690Z","createdBy":"system"},{"id":"device-list","title":"Device List Dashboard","description":"View and manage device inventory","type":"default","sharedWith":[],"layout":[],"createdAt":"2025-04-25T17:08:53.690Z","updatedAt":"2025-04-25T17:08:53.690Z","createdBy":"system"},{"id":"device-schedule","title":"Device Schedule Dashboard","description":"Track device certification schedules","type":"default","sharedWith":[],"layout":[],"createdAt":"2025-04-25T17:08:53.690Z","updatedAt":"2025-04-25T17:08:53.690Z","createdBy":"system"},{"id":"03ca8ff6-ef76-445b-89b3-5700ac2f7bf6","title":"test","description":"","type":"empty","sharedWith":[],"layout":[{"title":"test","type":"tasks","width":3,"height":3,"config":{},"id":"311488db-5931-40da-9448-f989cc581893","x":0,"y":0},{"title":"stream","type":"activity","width":3,"height":3,"config":{},"id":"b439f8af-077b-43c8-b537-ec6b6ea14f7e","x":3,"y":0},{"title":"s","type":"chart","width":6,"height":4,"config":{"chartType":"line"},"id":"9f62df19-d3ce-4e24-8d5f-1f9009edc773","x":0,"y":3}],"createdAt":"2025-04-25T21:46:28.686Z","updatedAt":"2025-04-28T17:30:44.712Z","createdBy":"Alex Carter"}]
    , // Replace with imported dashboardsData
  },
  {
    key: 'users',
    data: userData.users, // Replace with imported dashboardsData
  },
  // Add more objects for each key/data pair as needed
];

export function initializeLocalStorage() {
  DATA_TO_LOAD.forEach(({ key, data }) => {
    const existingData = localStorage.getItem(key);
    if (!existingData || existingData === '[]' || existingData === '{}') {
      localStorage.setItem(key, JSON.stringify(data));
      // Optionally, you can log or track what was initialized
      // console.log(`Initialized localStorage key: ${key}`);
    }
  });
}

// Usage: Call initializeLocalStorage() once in your main entry point (e.g., in App.tsx or index.tsx)
// You can customize this file to load any number of JSON files and keys as needed.
