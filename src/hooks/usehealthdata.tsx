// import { useState, useEffect } from 'react';
// import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

// const useHealthData = () => {
//   const [totalSteps, setTotalSteps] = useState(0);

//   const fetchStepsData = async () => {
//     let total = 0;

//     try {
//       // Initialize the client
//       const isInitialized = await initialize();
//       if (!isInitialized) {
//         console.error('Failed to initialize Health Connect');
//         return;
//       }

//       // Request permissions to read steps data
//       const grantedPermissions = await requestPermission([
//         { accessType: 'read', recordType: 'Steps' },
//       ]);
//       if (!grantedPermissions) {
//         console.error('Permissions were not granted');
//         return;
//       }

//       // Read the steps records
//       const { records } = await readRecords('Steps', {
//         timeRangeFilter: {
//           operator: 'between',
//           startTime: '2025-01-08T18:30:00.000Z', // Example date range
//           endTime: '2025-01-09T18:29:59.999Z',
//         },
//       });

//       // Calculate total steps
//       records.forEach((element) => {
//         total += element.count;
//       });

//       // Update the total steps
//       setTotalSteps(total);
//     } catch (error) {
//       console.error('Error reading health data:', error);
//     }
//   };

//   useEffect(() => {
//     fetchStepsData();
//   }, []);

//   return totalSteps;
// };

// export default useHealthData;
