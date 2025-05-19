import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, useColorScheme,
 StatusBar, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../Config/axios_config';
import AnimatedProgress from '../MyComponents/AnimatedProgress';
import AnimatedProgressBar from '../MyComponents/ProgressBar';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * HomeScreen
 * 
 * This screen is the main dashboard of the app that displays the user's daily nutritional data and progress.
 * It fetches and manages user information, including their nutritional goals and daily intake totals for various nutrients.
 * The screen handles date selection to view historical data and checks if the user has met specific nutritional goals,
 * triggering alerts and updating goal achievement stats accordingly. It also manages login streaks and ensures alerts
 * are only shown once per day. Navigation to other screens occurs based on the user's profile setup status.
 */

const { width, height } = Dimensions.get('window'); 
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.95;

const HomeScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const [userData, setUserData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    addedSugars: 0,
    totalSugars: 0,
    cholesterol: 0,
    transFat: 0,
    saturatedFat: 0,
    polyunsaturatedFat: 0,
    monounsaturatedFat: 0,
    calcium: 0,
    iron: 0,
    fiber: 0,
    sodium: 0,
    potassium: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    water: 0,
  });

  const [uniqueKey, setUniqueKey] = useState(Date.now()); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = [
    { key: 'Container1' },
    { key: 'Container2' },
    { key: 'Container3' }
  ];
  const ALERT_KEYS = {
    allGoals: 'alertAllGoals',
    calMac: 'alertCalMac',
    calorie: 'alertCalorie',
    fiber: 'alertFiber',
    water: 'alertWater',
  };

  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, insets);
  const flatListRef = useRef(null);

  // Function to convert date to YYYY-MM-DD format
  const getCurrentDate = (date) => {
    const now = date || new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }; 

  // Function to retrieve user data from databasr
  const fetchUserData = () => {
    // Send request to retrieve user data
    axiosInstance.get(`/api/users/name/${username}`)
      .then(response => {
        const userData = response.data;
        if (userData.alertData) {
          userData.alertData = JSON.parse(userData.alertData); // Used for goal met alerts
        } else {
          userData.alertData = {}; 
        }
        setUserData(userData); // Assign user data
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  };

  // Function to check if profile has been set up
  useEffect(() => {
    // Check to see if goals are already set, if not go to macro calculation screen
    if (userData && userData.initialLogin === false) {
      navigation.navigate('Macros', { user: userData });
    }
  }, [userData]);

  // Function to ensure 'met goal' alerts are only be displayed once per day
  const resetAlertFlags = async () => {
    const currentDate = getCurrentDate();
    await AsyncStorage.multiRemove(Object.values(ALERT_KEYS)); // Clear flags for the new day
    await AsyncStorage.setItem(ALERT_KEYS.allGoals, currentDate);
  };

  // Function to check if previous day ended with any goals met
  const checkNewDay = async (totals, lastCheckedDate) => {
    // Exit if no totals are present
    if (!totals || Object.keys(totals).length === 0) {
      console.warn("No totals available for checking goals.");
      return; 
    }

    // Declare the goal ranges for each nutrient
    const goalsMet = {
      calories: totals.calories >= userData.dailyCalorieGoal * 0.95 && totals.calories <= userData.dailyCalorieGoal * 1.05,
      protein: totals.protein >= userData.dailyProteinGoal * 0.95 && totals.protein <= userData.dailyProteinGoal * 1.05,
      carbs: totals.carbs >= userData.dailyCarbsGoal * 0.95 && totals.carbs <= userData.dailyCarbsGoal * 1.05,
      fat: totals.fat >= userData.dailyFatGoal * 0.95 && totals.fat <= userData.dailyFatGoal * 1.05,
      totalSugars: totals.totalSugars >= userData.totalSugars * 0.50 && totals.totalSugars <= userData.totalSugars * 1.5,
      addedSugars: totals.addedSugars <= userData.addedSugars * 1,
      transFat: totals.transFat <= userData.transFat * 1,
      saturatedFat: totals.saturatedFat <= userData.saturatedFat * 1,
      polyunsaturatedFat: totals.polyunsaturatedFat >= userData.polyunsaturatedFat * 0.85 && totals.polyunsaturatedFat <= userData.polyunsaturatedFat * 1.2,
      monounsaturatedFat: totals.monounsaturatedFat >= userData.monounsaturatedFat * 0.85 && totals.monounsaturatedFat <= userData.monounsaturatedFat * 1.2,
      cholesterol: totals.cholesterol <= userData.cholesterol * 1,
      fiber: totals.fiber >= userData.fiber * 0.95 && totals.fiber <= userData.fiber * 2,
      calcium: totals.calcium >= userData.calcium * 0.8 && totals.calcium <= userData.calcium * 1.2,
      iron: totals.iron >= userData.iron * 0.9 && totals.iron <= userData.iron * 1.25,
      sodium: totals.sodium >= userData.sodium * 0.25 && totals.sodium <= userData.sodium * 1,
      potassium: totals.potassium >= userData.potassium * 0.85 && totals.potassium <= userData.potassium * 1.2,
      vitaminA: totals.vitaminA >= userData.vitaminA * 0.8 && totals.vitaminA <= userData.vitaminA * 1.2,
      vitaminC: totals.vitaminC >= userData.vitaminC * 0.8 && totals.vitaminC <= userData.vitaminC * 2,
      vitaminD: totals.vitaminD >= userData.vitaminD * 0.8 && totals.vitaminD <= userData.vitaminD * 1.2,
      water: (totals.water*29.5735) >= userData.water * 0.95,
    };
  
    // Determine category flags
    const didMeetAllGoals = Object.values(goalsMet).every(Boolean);
    const didMeetCalorieGoal = goalsMet.calories;
    const didMeetCalMacGoal = goalsMet.calories && goalsMet.protein && goalsMet.carbs && goalsMet.fat;
    const didMeetFiberGoal = goalsMet.fiber;
    const didMeetWaterGoal = goalsMet.water;

    const currentDate = getCurrentDate();
  
    // Prepare data to send to the backend
    const updates = {
      id: userData.id,
      metAllGoals: userData.metAllGoals,
      metCalorieGoal: userData.metCalorieGoal,
      metCalMacGoal: userData.metCalMacGoal,
      metFiberGoal: userData.metFiberGoal,
      metWaterGoal: userData.metWaterGoal,
      metAllNum: userData.metAllNum,
      metCalorieNum: userData.metCalorieNum,
      metCalMacNum: userData.metCalMacNum,
      metFiberNum: userData.metFiberNum,
      metWaterNum: userData.metWaterNum,
    };

    // Update values if goals were met
    if (didMeetAllGoals) {
      updates.metAllGoals = lastCheckedDate;
      updates.metAllNum++;
    }
    if (didMeetCalorieGoal) {
      updates.metCalorieGoal = lastCheckedDate;
      updates.metCalorieNum++;
    }
    if (didMeetCalMacGoal) {
      updates.metCalMacGoal = lastCheckedDate;
      updates.metCalMacNum++;
    }
    if (didMeetFiberGoal) {
      updates.metFiberGoal = lastCheckedDate;
      updates.metFiberNum++;
    }
    if (didMeetWaterGoal) {
      updates.metWaterGoal = lastCheckedDate;
      updates.metWaterNum++;
    }

    // Check if today's alert flags are set in AsyncStorage
    const alertFlags = await AsyncStorage.multiGet(Object.values(ALERT_KEYS));
    const alertsShown = alertFlags.reduce((acc, [key, value]) => {
      acc[key] = value === currentDate; // true if shown today
      return acc;
    }, {});

    // Alert the user based on goals achieved
    if (didMeetAllGoals && !alertsShown[ALERT_KEYS.allGoals]) {
      Alert.alert("You're Unbelievable!", "You met ALL of your nutritional goals on your most recent logged day. " +
        "You are a Macros&More master! Check out the 'My Info' tab in Settings to see your other achievements.");
      await AsyncStorage.setItem(ALERT_KEYS.allGoals, currentDate);
    } else {
      if (didMeetCalMacGoal && !alertsShown[ALERT_KEYS.calMac]) {
        Alert.alert("You're killing it!", "You met all of your calorie and macros goals on your most recent logged day. " +
          "Check out the 'My Info' tab in Settings to see your other achievements.");
        await AsyncStorage.setItem(ALERT_KEYS.calMac, currentDate);
      }
      if (didMeetCalorieGoal && !alertsShown[ALERT_KEYS.calorie]) {
        Alert.alert("Goal Achieved!", "You met your calorie goal on your most recent logged day. " +
          "Check out the 'My Info' tab in Settings to see your other achievements.");
        await AsyncStorage.setItem(ALERT_KEYS.calorie, currentDate);
      }
      if (didMeetFiberGoal && !alertsShown[ALERT_KEYS.fiber]) {
        Alert.alert("Goal Achieved!", "You met your fiber goal on your most recent logged day. " +
          "Check out the 'My Info' tab in Settings to see your other achievements.");
        await AsyncStorage.setItem(ALERT_KEYS.fiber, currentDate);
      }
      if (didMeetWaterGoal && !alertsShown[ALERT_KEYS.water]) {
        Alert.alert("Goal Achieved!", "You met your water goal on your most recent logged day. " +
          "Check out the 'My Info' tab in Settings to see your other achievements.");
        await AsyncStorage.setItem(ALERT_KEYS.water, currentDate);
      }
    }

    // Only update the backend if at least one goal was met
    if (didMeetAllGoals || didMeetCalorieGoal || didMeetCalMacGoal || didMeetFiberGoal || didMeetWaterGoal) {
      try {
        await axiosInstance.put('/api/users/update', updates);
      } catch (error) {
        console.error("Error updating user goals:", error);
      }
    }

    // Update the last checked date
    try {
      await axiosInstance.put('/api/users/update', {
        id: userData.id,
        lastCheckedDate: currentDate,
      });
    } catch (error) {
      console.error("Error updating last checked date:", error);
    }
  };

  // Function to retrieve user's daily nutritional totals
  const fetchDailyTotals = async (date) => {
    const selectedDate = getCurrentDate(date);
    if (userData) {
      // Retrieve totals for selected date
      try {
        const response = await axiosInstance.get(`/api/foodlog/totals`, {
          params: {
            userId: userData.id,
            date: selectedDate,
          },
        });

        // Set dailyTotals as response
        const totals = response.data;
        setDailyTotals(totals);

        const currentDate = getCurrentDate();
        const lastCheckedDate = userData.lastCheckedDate;

        // If selectedDate is today...
        if ( selectedDate === currentDate) {
          // Initialize lastCheckedDate if it's the user's first login
          if (!lastCheckedDate) {
            await axiosInstance.put('/api/users/update', {
              id: userData.id,
              lastCheckedDate: currentDate,
              lastTotals: JSON.stringify(totals),
            });
            return; // Exit early since there's no previous data to check
          }
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDate = getCurrentDate(yesterday); // save yesterday's date to check goals

          let newStreakCount = userData.loginStreak;

          // Check if lastCheckedDate was yesterday
          if (lastCheckedDate === yesterdayDate) {
            // Increment the login streak
            newStreakCount += 1; 
          } else if (lastCheckedDate === currentDate) {
            // If lastCheckedDate is today, maintain streak value
            newStreakCount = newStreakCount;
          } else {
            // Reset the streak if it's not a consecutive login
            if (userData.loginStreak !== 1) {
              newStreakCount = 1; // Reset to 1
            }
          }

          // Update the streak if it's changed
          if (newStreakCount !== userData.loginStreak) {
            try {
              await axiosInstance.put('/api/users/update', {
                id: userData.id,
                loginStreak: newStreakCount,
              });
            } catch (error) {
              console.error("Error updating user streak:", error);
            }
          }

          // Check if lastCheckedDate is today
          if (lastCheckedDate === currentDate) {
            // If still same day, update saved totals
            await axiosInstance.put('/api/users/update', {
              id: userData.id,
              lastTotals: JSON.stringify(totals),
            });
          } else {
            // If it's a new day, check if previous day's totals met any goals
            const lastTotals = JSON.parse(userData.lastTotals);
            await checkNewDay(lastTotals, lastCheckedDate);
            // Reset alert flags
            await resetAlertFlags();
          }
        }
      } catch (error) {
        console.error("Error fetching daily totals:", error);
      }
    }
  };

  // Function to update date based on user selection
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // Function to reset saved date in local storage
  const resetDate = async () => { 
    await AsyncStorage.setItem('selectedDate', selectedDate.toISOString());
  };

  // Function to retrieve user's data and daily totals when screen is loaded
  useEffect(() => {
    fetchUserData();
    setSelectedDate(new Date()); // Reset to today’s date when component mounts

    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
      setUniqueKey(Date.now()); // Update the unique key to trigger animation restart
      setSelectedDate(new Date()); // Reset to today’s date when screen is focused
      fetchDailyTotals(new Date()); // Fetch daily totals for today's date
      setCurrentIndex(0); // Reset index to 0

      // Reset display to first container on focus
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation, username]);

  // Function to fetch daily totals whenever the selectedDate or userData changes
  useEffect(() => {
    if (userData) {
      fetchDailyTotals(selectedDate);
    }
  }, [selectedDate, userData]);

  // Function to calculate progress percentage
  const calculatePercentage = (current, goal) => {
    const currentValue = Number(current) || 0;
    const goalValue = Number(goal) || 1;
    return (currentValue / goalValue) * 100;
  }; 

  // Function to convert value to desired display format
  const formatNumber = (value) => {
    // Round the number to one decimal place
    const roundedValue = Math.round(value * 10) / 10;
  
    // Check if the rounded value is an integer
    if (Number.isInteger(roundedValue)) {
      return roundedValue.toString(); // Return as whole number
    } else {
      return roundedValue.toFixed(1); // Return with one decimal place
    }
  }

  if (!userData || !dailyTotals) {
    // Display section while loading
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>macros<Text style={styles.loadingTitle2}>&</Text><Text style={styles.loadingTitle}>more</Text></Text>
        <Text style={styles.loadingText}>Loading your information...</Text>
      </View>
    );
  }

  // Function to handle container scroll
  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / CONTAINER_WIDTH);
    setCurrentIndex(index);
  };

  const renderDot = (index) => {
    return (
      <View
        key={index}
        style={[
          styles.dot,
          { backgroundColor: currentIndex === index ? '#7323eb' : '#bbb' },
        ]}
      />
    );
  };

  const renderItem = ({ item }) => {
    const containerKey = `container-${currentIndex}`;

      switch (item.key) {
      case 'Container1':
        if (currentIndex != 0) {
          setUniqueKey(null);
        }
        return (
            <View style={[styles.innerContainer, { width: CONTAINER_WIDTH }]}>
              <Text style={styles.greeting}>Hello, {userData.firstName}!</Text>
                <View style={styles.calContainer}>
                    <View style={styles.containerCirc}>
                        <View style={styles.circleContainer3}>
                            <Text style={styles.text}>Water</Text>
                            <AnimatedProgress 
                                key={`water-${containerKey}-${uniqueKey}`}
                                toValue={currentIndex === 0 ? calculatePercentage(dailyTotals.water, userData.water / 29.5735) : 0} 
                                duration={1200} 
                                radius={height * .0485}
                                strokeWidth={height * .013}
                                fontSize={height * .02}
                                remainFont={height * .013}
                                height={height}
                                trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                                defaultColor={'#03fcf4'}
                                overflowColor={'#03fcf4'}
                                thresholdGreen={95} // Value to turn green
                                thresholdRed={500} // Value to start red overflow
                                remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                                goal={userData.water / 29.5735}
                                remaining={((userData?.water || 0) / 29.5735) - (dailyTotals?.water || 0)}
                                unit={' oz.'}
                                resetKey={currentIndex === 0 ? uniqueKey : null}
                            />
                            <Text style={styles.progressValues}>   {formatNumber(dailyTotals?.water || 0)} / {parseFloat((userData?.water || 0) / 29.5735).toFixed()} oz.</Text>
                        </View>
    
                        <View style={styles.circleContainer}>
                            <Text style={styles.label}>Calories</Text>
                            <AnimatedProgress 
                                key={`calories-${containerKey}-${uniqueKey}`}
                                toValue={currentIndex === 0 ? calculatePercentage(dailyTotals.calories, userData.dailyCalorieGoal) : 0} 
                                duration={1200} 
                                radius={height * .0785}
                                strokeWidth={height * .013}
                                fontSize={height * .025}
                                remainFont={height * .015}
                                height={height}
                                trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                                defaultColor={'#8438f5'}
                                overflowColor={'#8438f5'}
                                thresholdGreen={95} 
                                thresholdRed={106} 
                                remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                                goal={userData.dailyCalorieGoal}
                                remaining={(userData?.dailyCalorieGoal || 0) - (dailyTotals?.calories || 0)}
                                unit={''}
                                resetKey={currentIndex === 0 ? uniqueKey : null}
                            />
                            <Text style={styles.progressValues}> {dailyTotals.calories ? dailyTotals.calories.toFixed() : 0} / {userData?.dailyCalorieGoal || 0} kcal</Text>
                        </View>
    
                        <View style={styles.circleContainer3}>
                            <Text style={styles.text}>Fiber</Text>
                            
                            <AnimatedProgress 
                                key={`fiber-${containerKey}-${uniqueKey}`}
                                toValue={currentIndex === 0 ? calculatePercentage(dailyTotals.fiber, userData.fiber) : 0} 
                                duration={1200} 
                                radius={height * .0485}
                                strokeWidth={height * .013}
                                fontSize={height * .02}
                                remainFont={height * .013}
                                height={height}
                                trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                                defaultColor={'#ff9f45'}
                                overflowColor={'#ff9f45'}
                                thresholdGreen={95}  
                                thresholdRed={200}  
                                remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                                goal={userData.fiber}
                                remaining={(userData?.fiber || 0) - (dailyTotals?.fiber || 0)}
                                unit={'g'}
                                resetKey={currentIndex === 0 ? uniqueKey : null}
                            />
                            <Text style={styles.progressValues}> {formatNumber(dailyTotals?.fiber || 0)} / {userData?.fiber || 0}g</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.sections}>Macros</Text>
                <View style={styles.containerCirc}>
                <View style={styles.circleContainer}>
            <Text style={styles.text}>Protein</Text>
              <AnimatedProgress 
                key={`protein-${containerKey}-${uniqueKey}`}
                toValue={currentIndex === 0 ? calculatePercentage(dailyTotals.protein, userData.dailyProteinGoal) : 0} 
                duration={1200} 
                radius={height * .0535}
                strokeWidth={height * .013}
                fontSize={height * .02}
                remainFont={height * .013}
                height={height}
                trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                defaultColor={'#f5cd1b'}
                overflowColor={'#fad841'}
                thresholdGreen={95}  
                thresholdRed={106}  
                remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                goal={userData.dailyProteinGoal}
                remaining={(userData?.dailyProteinGoal || 0) - (dailyTotals?.protein || 0)}
                unit={'g'}
                resetKey={currentIndex === 0 ? uniqueKey : null}
              />
              <Text style={styles.progressValues}> {formatNumber(dailyTotals?.protein || 0)} / {userData?.dailyProteinGoal || 0}g</Text>
            </View>

            <View style={styles.circleContainer}>
            <Text style={styles.text}>Carbs</Text>
              <AnimatedProgress 
                key={`water-${containerKey}-${uniqueKey}`}
                toValue={currentIndex === 0 ? calculatePercentage(dailyTotals.carbs, userData.dailyCarbsGoal) : 0}
                duration={1200} 
                radius={height * .0535}
                strokeWidth={height * .013}
                fontSize={height * .02}
                remainFont={height * .013}
                height={height}
                trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                defaultColor={'#00aaff'}
                overflowColor={'#00aaff'}
                thresholdGreen={95}  
                thresholdRed={106}  
                remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                goal={userData.dailyCarbsGoal}
                remaining={(userData?.dailyCarbsGoal || 0) - (dailyTotals?.carbs || 0)}
                unit={'g'}
                resetKey={currentIndex === 0 ? uniqueKey : null}
              />
              <Text style={styles.progressValues}> {formatNumber(dailyTotals?.carbs || 0)} / {userData?.dailyCarbsGoal || 0}g</Text>
            </View>
            
            <View style={styles.circleContainer}>
            <Text style={styles.text}>Fat</Text>
              <AnimatedProgress 
                key={`fat-${containerKey}-${uniqueKey}`}
                toValue={currentIndex === 0 ? calculatePercentage(dailyTotals.fat, userData.dailyFatGoal) : 0} 
                duration={1200} 
                radius={height * .0535}
                strokeWidth={height * .013}
                fontSize={height * .02}
                remainFont={height * .013}
                height={height}
                trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                defaultColor={'#eb23dd'}
                overflowColor={'#eb23dd'}
                thresholdGreen={95}  
                thresholdRed={106}  
                remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                goal={userData.dailyFatGoal}
                remaining={(userData?.dailyFatGoal) - (dailyTotals?.fat || 0)}
                unit={'g'}
                resetKey={currentIndex === 0 ? uniqueKey : null}
              />
              <Text style={styles.progressValues}> {formatNumber(dailyTotals?.fat || 0)} / {userData?.dailyFatGoal || 0}g</Text>
            </View>
                </View>
            </View>
        );
    
        case 'Container2':
          if (currentIndex != 0) {
            setUniqueKey(null);
          }
            return (
                <View style={[styles.innerContainer, { width: CONTAINER_WIDTH }]}>
                  <Text style={styles.sections4}>Sugars</Text>
                    <View style={styles.containerCirc}>
              <View style={styles.circleContainer2}>
                <Text style={styles.text}>Added Sugars</Text>
                <AnimatedProgress 
                  key={`addsug-${containerKey}-${uniqueKey}`}
                  toValue={currentIndex === 1 ? calculatePercentage(dailyTotals.addedSugars, userData.addedSugars) : 0}
                  duration={1200} 
                  radius={height * .0535}
                  strokeWidth={height * .013}
                  fontSize={height * .02}
                  remainFont={height * .013}
                  height={height}
                  trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                  defaultColor={'#fad841'}
                  overflowColor={'#fad841'}
                  thresholdGreen={0}  
                  thresholdRed={101}  
                  remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                  goal={userData?.addedSugars ?? 0}
                  remaining={(userData?.addedSugars || 0) - (dailyTotals?.addedSugars || 0)}
                  unit={'g'}
                  resetKey={currentIndex === 1 ? uniqueKey : null}
                />
                <Text style={styles.progressValues}> {formatNumber(dailyTotals?.addedSugars || 0)} / {userData?.addedSugars || 0}g</Text>
              </View>

              <View style={styles.circleContainer2}>
              <Text style={styles.text}>Total Sugars</Text>
                <AnimatedProgress 
                  key={`totsug-${containerKey}-${uniqueKey}`}
                  toValue={currentIndex === 1 ? calculatePercentage(dailyTotals.totalSugars, userData.totalSugars) : 0} 
                  duration={1200} 
                  radius={height * .0535}
                  strokeWidth={height * .013}
                  fontSize={height * .02}
                  remainFont={height * .013}
                  height={height}
                  trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                  defaultColor={'#eb23dd'}
                  overflowColor={'#eb23dd'}
                  thresholdGreen={50} 
                  thresholdRed={151}  
                  remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                  goal={userData?.totalSugars ?? 0}
                  remaining={(userData?.totalSugars || 0) - (dailyTotals?.totalSugars || 0)}
                  unit={'g'}
                  resetKey={currentIndex === 1 ? uniqueKey : null}
                />
                <Text style={styles.progressValues}> {formatNumber(dailyTotals?.totalSugars || 0)} / {userData?.totalSugars || 0}g</Text>
              </View>
            </View>

            <View style={styles.lineContainer}>
              <View style={styles.line}/></View>
            

            <View style={styles.barContainer}>
              <Text style={styles.sections5}>Fats</Text>
            <AnimatedProgressBar
              progress={currentIndex === 1 ? calculatePercentage(dailyTotals.cholesterol, userData.cholesterol) : 0}
              key={`chol-${containerKey}-${uniqueKey}`}
              label="Cholesterol"
              color='#7323eb'
              consumed={dailyTotals?.cholesterol || 0}
              goal={userData?.cholesterol || 0}
              unit='mg'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={0}
              redThreshold={101}
            />
            <AnimatedProgressBar
              progress={currentIndex === 1 ? calculatePercentage(dailyTotals.transFat, userData.transFat): 0}
              key={`trans-${containerKey}-${uniqueKey}`}
              label="Trans Fat"
              color='#7323eb'
              consumed={dailyTotals?.transFat || 0}
              goal={userData?.transFat || 0}
              unit='g'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={0}
              redThreshold={101}
            />
            <AnimatedProgressBar
              
              progress={currentIndex === 1 ? calculatePercentage(dailyTotals.saturatedFat, userData.saturatedFat) : 0}
              key={`sat-${containerKey}-${uniqueKey}`}
              label="Saturated Fat"
              color='#7323eb'
              consumed={dailyTotals?.saturatedFat || 0}
              goal={userData?.saturatedFat || 0}
              unit='g'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={0}
              redThreshold={101}
            />
            <AnimatedProgressBar
              progress={currentIndex === 1 ? calculatePercentage(dailyTotals.polyunsaturatedFat, userData.polyunsaturatedFat) : 0 }
              key={`poly-${containerKey}-${uniqueKey}`}
              label="Polyunsaturated"
              color='#7323eb'
              consumed={dailyTotals?.polyunsaturatedFat || 0}
              goal={userData?.polyunsaturatedFat || 0}
              unit='g'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={85}
              redThreshold={121}
            />
            <AnimatedProgressBar
              key={`mono-${containerKey}-${uniqueKey}`}
              progress={currentIndex === 1 ? calculatePercentage(dailyTotals.monounsaturatedFat, userData.monounsaturatedFat) : 0}
              label="Monounsaturated"
              color='#7323eb'
              consumed={dailyTotals?.monounsaturatedFat || 0}
              goal={userData?.monounsaturatedFat || 0}
              unit='g'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={85}
              redThreshold={121}
            />
            
            </View>
                </View>
            );
        case 'Container3':
          if (currentIndex != 2) {
            setUniqueKey(null);
          }
            return (
                <View style={[styles.innerContainer2, { width: CONTAINER_WIDTH }]}>
                  <Text style={styles.sections3}>Vitamins</Text>
                  {currentIndex != 0 && (
                  <>
                <View style={styles.containerCirc}>
                
                <View style={styles.circleContainer4}>
                <Text style={styles.text}>Vitamin A</Text>
                  <AnimatedProgress 
                    key={`vita-${containerKey}`}
                    toValue={currentIndex === 2 ? calculatePercentage(dailyTotals.vitaminA, userData.vitaminA) : 0}
                    duration={1200} 
                    radius={height * .0535}
                    strokeWidth={height * .013}
                    fontSize={height * .018}
                    remainFont={height * .013}
                    height={height}
                    trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                    defaultColor={'#eb23dd'}
                    overflowColor={'#eb23dd'}
                    thresholdGreen={80} 
                    thresholdRed={121} 
                    remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                    goal={userData.vitaminA}
                    remaining={(userData?.vitaminA || 0) - (dailyTotals?.vitaminA || 0)}
                    unit={'mcg'}
                    resetKey={currentIndex === 2 ? uniqueKey : null}
                  />
                  <Text style={styles.progressValues}> {formatNumber(dailyTotals?.vitaminA || 0)} / {userData?.vitaminA || 0}mcg</Text>
                </View>
                <View style={styles.circleContainer4}>
                <Text style={styles.text}>Vitamin C</Text>
                  <AnimatedProgress 
                    key={`vitc-${containerKey}`}
                    toValue={currentIndex === 2 ? calculatePercentage(dailyTotals.vitaminC, userData.vitaminC) : 0} 
                    duration={1200} 
                    radius={height * .0535}
                    strokeWidth={height * .013}
                    fontSize={height * .02}
                    remainFont={height * .013}
                    defaultColor={'#ff9f45'}
                    overflowColor={'#ff9f45'}
                    trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                    thresholdGreen={80} 
                    thresholdRed={201} 
                    remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                    goal={userData.vitaminC}
                    remaining={(userData?.vitaminC || 0) - (dailyTotals?.vitaminC || 0)}
                    unit={'mg'}
                    resetKey={currentIndex === 2 ? uniqueKey : null}
                  />
                  <Text style={styles.progressValues}> {formatNumber(dailyTotals?.vitaminC || 0)} / {userData?.vitaminC || 0}mg</Text>
                </View>
                <View style={styles.circleContainer4}>
                <Text style={styles.text}>Vitamin D</Text>
                  <AnimatedProgress 
                    key={`vitd-${containerKey}`}
                    toValue={currentIndex === 2 ? calculatePercentage(dailyTotals.vitaminD, userData.vitaminD) : 0} 
                    duration={1200} 
                    radius={height * .0535}
                    strokeWidth={height * .013}
                    fontSize={height * .018}
                    remainFont={height * .013}
                    trackColor={colorScheme === 'dark' ? '#e6e6e6' : '#e6e3e3'}
                    defaultColor={'#f5cd1b'}
                    overflowColor={'#fad841'}
                    thresholdGreen={80} 
                    thresholdRed={121}  
                    remainColor={colorScheme === 'dark' ? 'white' : 'black'}
                    goal={userData.vitaminD}
                    remaining={(userData?.vitaminD || 0) - (dailyTotals?.vitaminD || 0)}
                    unit={'mcg'}
                    resetKey={currentIndex ===  2 ? uniqueKey : null}
                  />
                  <Text style={styles.progressValues}> {formatNumber(dailyTotals?.vitaminD || 0)} / {userData?.vitaminD || 0}g</Text>
                </View>
              </View>

              <View style={styles.lineContainer2}>
              <View style={styles.line}/></View>

              <View style={styles.barContainer2}>
              <Text style={styles.sections2}>Minerals</Text>
              <AnimatedProgressBar
                progress={currentIndex === 2 ? calculatePercentage(dailyTotals.calcium, userData.calcium) : 0}
                key={`calc-${containerKey}-${uniqueKey}`}
                label="Calcium"
                color='#7323eb'
                consumed={dailyTotals?.calcium || 0}
                goal={userData?.calcium || 0}
                unit='mg'
                font={height * .0172}
                colorScheme={colorScheme}
                barHeight={height * .0115}
                greenThreshold={80}
                redThreshold={181}
            />
            <AnimatedProgressBar
              progress={currentIndex === 2 ? calculatePercentage(dailyTotals.iron, userData.iron) : 0}
              key={`iron-${containerKey}-${uniqueKey}`}
              label="Iron"
              color='#7323eb'
              consumed={dailyTotals?.iron || 0}
              goal={userData?.iron || 0}
              unit='mg'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={90}
              redThreshold={126}
            />
            <AnimatedProgressBar
              
              progress={currentIndex === 2 ? calculatePercentage(dailyTotals.sodium, userData.sodium) : 0}
              key={`sodium-${containerKey}-${uniqueKey}`}
              label="Sodium"
              color='#7323eb'
              consumed={dailyTotals?.sodium || 0}
              goal={userData?.sodium || 0}
              unit='mg'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={25}
              redThreshold={101}
            />
            <AnimatedProgressBar
              progress={currentIndex ===2 ? calculatePercentage(dailyTotals.potassium, userData.potassium) : 0}
              key={`poly-${containerKey}-${uniqueKey}`}
              label="Potassium"
              color='#7323eb'
              consumed={dailyTotals?.potassium || 0}
              goal={userData?.potassium || 0}
              unit='mg'
              font={height * .0172}
              colorScheme={colorScheme}
              barHeight={height * .0115}
              greenThreshold={80}
              redThreshold={121}
            />
            </View>
            </>
                  )}
            </View>
            );
        default:
            return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor={colorScheme === 'dark' ? 'white' : 'black'}
      />
      <View style={styles.topSafe}></View>        
      <View style={styles.header}>
        <Text style={styles.title}>macros<Text style={styles.title2}>&</Text><Text style={styles.title}>more</Text></Text>
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => navigation.navigate('Settings', { user: userData })}
          >
            <Icon name="settings-outline" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false} scrollEnabled={false}>
  
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          style={styles.picker}
        />

        <View style={styles.progressContainer}>
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.flatListContent, { paddingHorizontal: (SCREEN_WIDTH - CONTAINER_WIDTH) / 2 }]}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            snapToAlignment="start"
            snapToInterval={CONTAINER_WIDTH + 10}
            decelerationRate="fast"
            pagingEnabled
            onScroll={handleScroll}
            ref={flatListRef}
          />
          <View style={styles.dotsContainer}>
            {data.map((_, index) => renderDot(index))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomIconsContainer}>
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => navigation.navigate('Home', { username })}
        >
          <Icon name="home" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={async () => {
            // Wait for resetDate to complete
            await resetDate(); 
            
            // Navigate after resetDate is done
            navigation.navigate('Log Food', { user: userData });
          }}
        >
          <Icon name="add-circle-outline" size={width * .065} color='#5f91f5' />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={async () => {
            // Wait for resetDate to complete
            await resetDate(); 

            // Navigate after resetDate is done
            navigation.navigate('My Food Log', { userId: userData.id, user: userData });
          }}
        >
          <Icon name="list" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7323eb',
  },
  loadingTitle: {
    textAlign: 'center',
    fontFamily: 'VarelaRound-Regular',
    color: 'white',
    fontSize: height * .0465,
    bottom: height * .05,
  },
  loadingTitle2: {
    textAlign: 'center',
    fontFamily: 'RoundedMplus1c-Bold',
    color: 'white',
    fontSize: height * .035,
  },
  loadingText: {
    fontFamily: 'VarelaRound-Regular',
    color: 'white',
    fontSize: height * .02,
    top: height * .25,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: height * .028,
  },
  text: {
    fontSize: height * .0195,
    marginBottom: height * .005,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  picker: {
    top: height * -.01,
    marginLeft: width * .03,
    marginRight: 'auto',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : '#7323eb',
    fontSize: height * .038,
    top: height * .009,
    marginBottom: height * -.018,
  },
  title2: {
      textAlign: 'center',
      fontFamily: 'RoundedMplus1c-Bold',
      color: colorScheme === 'dark' ? 'white' : '#7323eb',
      fontSize: height * .0285,
  },
  settingsIcon: {
    position: 'absolute',
    top: height * .016,
    right: height * .0235,
    zIndex: 10,
  },
  scrollViewContent: { 
    paddingTop: height * .02,
  },
  innerContainer: {
    height: height * .69,
    marginRight: 10,
    marginBottom: height * .0125,
    paddingBottom: 0,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#a8a8a8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorScheme === 'dark' ? '#27282b' : '#f7f7f7',
    elevation: 3,
    shadowColor: colorScheme === 'dark' ? '#0a0a0a' : '#2b2a2a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  innerContainer2: {
    height: height * .69,
    marginBottom: height * .0125,
    paddingBottom: 0,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#a8a8a8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorScheme === 'dark' ? '#27282b' : '#f7f7f7',
    elevation: 3,
    shadowColor: colorScheme === 'dark' ? '#0a0a0a' : '#2b2a2a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  dotsContainer: {
    position: 'relative',
    bottom: -8,
    flexDirection: 'row',
  },
  dot: {
    height: height * .01,
    width: width * .022,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  progressContainer: {
    alignItems: 'center',
  },
  containerCirc: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    paddingTop: 10,
  },
  circleContainer: {
    marginHorizontal: width * .028,
    top: height * .01,
  },
  circleContainer2: {
    marginHorizontal: width * .07,
  },
  circleContainer3: {
    marginTop: height * .128,
  },
  circleContainer4: {
    marginHorizontal: width * .028,
    top: height * -.01,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * .016,
    marginTop: 20,
    marginBottom: -33,
  },
  lineContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * .016,
    marginTop: 20,
    marginBottom: -33,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: 'slategray',
  },
  barContainer: {
    marginTop: height * .055,
    padding: 10,
  },
  barContainer2: {
    marginTop: height * .085,
    padding: 10,
    top: height * .01,
  },
  greeting: {
    fontSize: height * .023,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    color: '#a8a8a8',
    marginTop: height * -.051,
    top: height * .01,
    paddingBottom: height * .015,
    textAlign: 'center',
  },
  sections: {
    fontSize: height * .023,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    color: '#a8a8a8',
    marginTop: height * .005,
    position: 'relative',
    top: height * .011,
    paddingBottom: height * .005,
    textAlign: 'center',
  },
  sections2: {
    fontSize: height * .023,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    color: '#a8a8a8',
    marginTop: height * -.032,
    paddingBottom: height * .020,
    textAlign: 'center',
  },
  sections3: {
    fontSize: height * .023,
    top: height * -.02,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    color: '#a8a8a8',
    paddingBottom: height * .005,
    textAlign: 'center',
  },
  sections4: {
    fontSize: height * .023,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    color: '#a8a8a8',
    paddingBottom: height * .010,
    textAlign: 'center',
  },
  sections5: {
    fontSize: height * .023,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    color: '#a8a8a8',
    paddingBottom: height * .010,
    textAlign: 'center',
  },
  label: {
    fontSize: height * .0215,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    marginBottom: height * .008,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  progressValues: {
    fontSize: height * .015,
    fontFamily: 'Quicksand-Bold',
    paddingTop: height * .008,
    paddingBottom: height * .010,
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  bottomIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderColor: colorScheme === 'dark' ? 'lightgrey' : '#919090',
    paddingVertical: height * .015,
    paddingBottom: insets.bottom === 0 ? height * .015 : insets.bottom - height * .005,
    bottom: 0,
    backgroundColor: colorScheme === 'dark' ? 'black' : '#e0dede',
  },
  bottomIcon: {
    alignItems: 'center',
  },
});

export default HomeScreen;
