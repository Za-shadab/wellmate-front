import { useState, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { URL } from '../constants/url';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import { useuserDetailContext } from '../app/context/UserDetailContext';

// Add interfaces for type safety
interface HealthData {
  steps: number;
  caloriesBurned: number;
  heartRate: number;
  glucoseLevel: number;
  sleepHours: number;
}

interface WeeklyHealthData {
  weeklyHeartRate: number[];
  weeklySteps: number[]; // Added weekly steps array
  weekDays: string[];
}

interface HourlyHealthData {
  hourlyHeartRate: number[];
  hours: string[];
}

interface UserDetail {
  regularId: string;
}

// Add these interfaces at the top
interface FetchState {
  lastFetchTime: number;
  isFetching: boolean;
}

// Add this type definition for fetch intervals
type FetchIntervalKey = 'HOURLY' | 'DAILY' | 'WEEKLY';

// Update the FETCH_INTERVALS constant with proper typing
const FETCH_INTERVALS: Record<FetchIntervalKey, number> = {
  HOURLY: 1000 * 60 * 60, // 1 hour
  DAILY: 1000 * 60 * 60 * 24, // 24 hours
  WEEKLY: 1000 * 60 * 60 * 24 * 7 // 7 days
};

const RATE_LIMIT_INTERVAL = 60000; // 1 minute

const useHealthData = (userDetail?: UserDetail) => {
  const [healthData, setHealthData] = useState<HealthData>({
    steps: 0,
    caloriesBurned: 0,
    heartRate: 0,
    glucoseLevel: 0,
    sleepHours: 0,
  });

  const [weeklyHealthData, setWeeklyHealthData] = useState<WeeklyHealthData>({
    weeklyHeartRate: [],
    weeklySteps: [], // Initialize weekly steps array
    weekDays: []
  });

  const [hourlyHealthData, setHourlyHealthData] = useState<HourlyHealthData>({
    hourlyHeartRate: [],
    hours: []
  });

  const appState = useRef(AppState.currentState);
  const lastFetchTime = useRef<{ [key: string]: number }>({
    hourly: 0,
    weekly: 0,
  });

  const { userDetail: userDetails } = useuserDetailContext();
  const user = userDetail || userDetails;
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  // Add fetch state tracking
  const fetchState = useRef<{ [key: string]: FetchState }>({
    hourly: { lastFetchTime: 0, isFetching: false },
    daily: { lastFetchTime: 0, isFetching: false },
    weekly: { lastFetchTime: 0, isFetching: false }
  });

  // Calculate activity level based on steps
  const calculateActivityLevel = (steps: number): string => {
    if (steps < 5000) return 'Not Very Active';
    if (steps < 7500) return 'Lightly Active';
    if (steps < 10000) return 'Active';
    return 'Very Active';
  };

  const canFetchData = (key: string): boolean => {
    const now = Date.now();
    if (now - lastFetchTime.current[key] < RATE_LIMIT_INTERVAL) {
      console.log(`Skipping ${key} fetch due to rate limit`);
      return false;
    }
    lastFetchTime.current[key] = now;
    return true;
  };

  const RATE_LIMIT_DELAY = 60000; // 1 minute delay for retries

  let retryCount = 0;
  const MAX_RETRIES = 3;

  // Update the shouldFetchData function with proper typing
  const shouldFetchData = (key: Lowercase<FetchIntervalKey>): boolean => {
    const now = Date.now();
    const state = fetchState.current[key];

    if (state.isFetching) {
      console.log(`Skipping ${key} fetch - already in progress`);
      return false;
    }

    // Convert key to uppercase to match FETCH_INTERVALS keys
    const intervalKey = key.toUpperCase() as FetchIntervalKey;
    const interval = FETCH_INTERVALS[intervalKey];
    
    if (now - state.lastFetchTime < interval) {
      console.log(`Skipping ${key} fetch - within interval`);
      return false;
    }

    return true;
  };

  const fetchHourlyHeartRateData = async () => {
    if (!shouldFetchData('hourly')) return;

    const state = fetchState.current.hourly;
    state.isFetching = true;

    try {
      const isInitialized = await initialize();
      if (!isInitialized) {
        console.error('Failed to initialize Health Connect');
        return;
      }

      const granted = await requestPermission([{ accessType: 'read', recordType: 'HeartRate' }]);
      if (!granted) {
        console.error('Permissions were not granted');
        return;
      }

      const hourlyHeartRate: number[] = [];
      const hours: string[] = [];
      const now = new Date();
      for (let i = 0; i < 24; i++) {
        const startTime = new Date(now.setHours(i, 0, 0, 0)).toISOString();
        const endTime = new Date(now.setHours(i, 59, 59, 999)).toISOString();
        hours.push(`${i}:00`);

        const heartRateData = await readRecords('HeartRate', { timeRangeFilter: { operator: 'between', startTime, endTime } });
        const avgHeartRate = heartRateData.records.length > 0
          ? heartRateData.records.reduce((sum, record) => sum + record.samples[0].beatsPerMinute, 0) / heartRateData.records.length
          : 0;

        hourlyHeartRate.push(parseFloat(avgHeartRate.toFixed(2)));
      }
      setHourlyHealthData({ hourlyHeartRate, hours });

      // Update last fetch time on success
      state.lastFetchTime = Date.now();
    } catch (error:any) {
      if (error.message?.includes('Rate limited')) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.error(`Rate limit exceeded. Retrying (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(fetchHourlyHeartRateData, RATE_LIMIT_DELAY);
        } else {
          console.error('Max retries reached. Stopping further attempts.');
        }
      } else {
        console.error('Error reading hourly heart rate data:', error);
      }
    } finally {
      state.isFetching = false;
    }
  };

  const fetchWeeklyHealthData = async () => {
    if (!shouldFetchData('weekly')) return;

    const state = fetchState.current.weekly;
    state.isFetching = true;

    try {
      const isInitialized = await initialize();
      if (!isInitialized) {
        console.error('Failed to initialize Health Connect');
        return;
      }

      const granted = await requestPermission([
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'Steps' } // Add steps permission
      ]);
      
      if (!granted) {
        console.error('Permissions were not granted');
        return;
      }

      const weeklyHeartRate: number[] = [];
      const weeklySteps: number[] = []; // Create weekly steps array
      const weekDays: string[] = [];
      
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        weekDays.push(dayName);
        
        const startTime = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const endTime = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        // Fetch heart rate data
        const heartRateData = await readRecords('HeartRate', { timeRangeFilter: { operator: 'between', startTime, endTime } });
        const avgHeartRate = heartRateData.records.length > 0
          ? heartRateData.records.reduce((sum, record) => sum + record.samples[0].beatsPerMinute, 0) / heartRateData.records.length
          : 0;

        weeklyHeartRate.push(parseFloat(avgHeartRate.toFixed(2)));

        // Fetch steps data for the same day
        const stepsData = await readRecords('Steps', { timeRangeFilter: { operator: 'between', startTime, endTime } });
        const totalSteps = stepsData.records.reduce((sum, record) => sum + (record.count || 0), 0);
        
        weeklySteps.push(totalSteps);
      }

      setWeeklyHealthData({
        weeklyHeartRate,
        weeklySteps, // Include weekly steps in state update
        weekDays,
      });

      state.lastFetchTime = Date.now();
    } catch (error:any) {
      if (error.message?.includes('Rate limited')) {
        console.error('Rate limit exceeded for weekly fetch. Retrying after delay...');
        setTimeout(fetchWeeklyHealthData, RATE_LIMIT_DELAY);
      } else {
        console.error('Error reading weekly health data:', error);
      }
    } finally {
      state.isFetching = false;
    }
  };

  const fetchHealthData = async () => {
    if (!shouldFetchData('daily')) return;

    const state = fetchState.current.daily;
    state.isFetching = true;

    try {
      const isInitialized = await initialize();
      if (!isInitialized) {
        console.error('Failed to initialize Health Connect');
        return;
      }

      const granted = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'BloodGlucose' },
        { accessType: 'read', recordType: 'SleepSession' },
      ]);
      
      if (!granted) {
        console.error('Permissions were not granted');
        return;
      }

      const now = new Date();
      const startTime = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const endTime = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      // Fetch data with rate limit handling
      if (shouldFetchData('weekly')) {
        await fetchWeeklyHealthData();
      }
      
      if (shouldFetchData('hourly')) {
        await fetchHourlyHeartRateData();
      }
      
      const stepsData = await readRecords('Steps', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const totalSteps = stepsData.records.reduce((sum, record) => sum + (record.count || 0), 0);
      
      const caloriesData = await readRecords('ActiveCaloriesBurned', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const totalCalories = caloriesData.records.reduce((sum, record) => sum + (record.energy.inCalories || 0), 0);
      
      const heartRateData = await readRecords('HeartRate', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const latestHeartRate = heartRateData.records.length > 0 
        ? heartRateData.records[heartRateData.records.length - 1].samples[0].beatsPerMinute 
        : 0;
      
      const glucoseData = await readRecords('BloodGlucose', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const latestGlucose = glucoseData.records.length > 0 ? glucoseData.records[glucoseData.records.length - 1].level : 0;

      const sleepData = await readRecords('SleepSession', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const totalSleepHours = sleepData.records.reduce(
        (sum, record) => sum + ((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / (1000 * 60 * 60)), 
        0
      );
      
      setHealthData({
        steps: totalSteps,
        caloriesBurned: totalCalories,
        heartRate: Number(latestHeartRate),
        glucoseLevel: latestGlucose && typeof latestGlucose === "object" 
        ? latestGlucose.inMilligramsPerDeciliter ?? latestGlucose.inMillimolesPerLiter ?? 0
        : 0,
        sleepHours: parseFloat(totalSleepHours.toFixed(2)),
      });

      state.lastFetchTime = Date.now();
    } catch (error) {
      console.error('Error reading health data:', error);
    } finally {
      state.isFetching = false;
    }
  };

  const submitDailySummary = async () => {
    try {
      const today = new Date().toDateString();
      if (lastSyncDate === today) {
        console.log('Already synced today');
        return;
      }

      // Use the combined user value instead of userDetail directly
      if (!user?.regularId) {
        console.log("Current user:", user);
        console.error('No user ID available');
        return;
      }

      // Use cached data instead of fetching again
      const summary = {
        userId: user.regularId,
        date: new Date().toISOString(),
        summary: {
          averageHeartRate: healthData.heartRate,
          totalSteps: healthData.steps,
          totalCaloriesBurned: healthData.caloriesBurned,
          averageGlucoseLevel: healthData.glucoseLevel,
          totalSleepHours: healthData.sleepHours,
          activityLevel: calculateActivityLevel(healthData.steps)
        },
        hourlyHeartRate: hourlyHealthData.hourlyHeartRate.map((value, index) => ({
          hour: hourlyHealthData.hours[index],
          value
        })),
        weeklyHeartRate: weeklyHealthData.weeklyHeartRate.map((value, index) => ({
          day: weeklyHealthData.weekDays[index],
          value
        })),
        weeklySteps: weeklyHealthData.weeklySteps.map((value, index) => ({
          day: weeklyHealthData.weekDays[index],
          value
        }))
      };

      await axios.put(`${URL}/health/summary`, summary);
      await AsyncStorage.setItem('lastHealthSync', today);
      setLastSyncDate(today);

    } catch (error) {
      console.error('Error submitting daily summary:', error);
      throw error;
    }
  };

  // Schedule end of day sync
  useEffect(() => {
    const scheduleEndOfDaySync = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const timeUntilEndOfDay = endOfDay.getTime() - now.getTime();
      
      const timer = setTimeout(async () => {
        try {
          await submitDailySummary();
        } catch (error) {
          console.error('Failed to sync at end of day:', error);
        }
      }, timeUntilEndOfDay);

      return () => clearTimeout(timer);
    };

    return scheduleEndOfDaySync();
  }, [user]); // Add user as dependency

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active' &&
        shouldFetchData('daily')
      ) {
        fetchHealthData();
      } else if (
        appState.current === 'active' && 
        nextAppState.match(/inactive|background/)
      ) {
        const now = new Date();
        const currentHour = now.getHours();
        if (currentHour >= 23) {
          submitDailySummary().catch(console.error);
        }
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [healthData, hourlyHealthData, weeklyHealthData, user]); // Add user as dependency

  // Load last sync date on mount
  useEffect(() => {
    const loadLastSyncDate = async () => {
      try {
        const date = await AsyncStorage.getItem('lastHealthSync');
        setLastSyncDate(date);
      } catch (error) {
        console.error('Error loading last sync date:', error);
      }
    };
    loadLastSyncDate();
  }, []);

  return {
    healthData,
    weeklyHealthData,
    hourlyHealthData,
    fetchHealthData,
    fetchHourlyHeartRateData,
    fetchWeeklyHealthData,
    submitDailySummary
  };
};

export default useHealthData;