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
    data: [], // Replace with imported workflowsData
  },
  {
    key: 'dashboards',
    data: [], // Replace with imported dashboardsData
  },
  {
    key: 'users',
    data: userData.users, // Replace with imported dashboardsData
  },
  // Add more objects for each key/data pair as needed
];

export function initializeLocalStorage() {
  DATA_TO_LOAD.forEach(({ key, data }) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
      // Optionally, you can log or track what was initialized
      // console.log(`Initialized localStorage key: ${key}`);
    }
  });
}

// Usage: Call initializeLocalStorage() once in your main entry point (e.g., in App.tsx or index.tsx)
// You can customize this file to load any number of JSON files and keys as needed.
