import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import axiosInstance from '../../Config/axios_config';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';

/** 
 * MyFoodLogScreen
 * 
 * This screen displays the user's daily food log, showing individual food entries, nutritional totals, 
 * and allowing interaction with logged items. It loads food log data based on the selected date, 
 * supports date selection, and retrieves data from local storage and the backend API. Users can 
 * delete entries using swipe gestures, tap entries to view detailed information, or navigate to log water intake. 
 * The screen also calculates and displays daily and per-meal nutrition totals, offering navigation to deeper detail 
 * views when totals or meal sections are tapped. 
 */

const { width, height } = Dimensions.get('window'); 

const MyFoodLogScreen = ({ navigation }) => {
  const route = useRoute();
  const { userId, user } = route.params;
  const [pressedItemId, setPressedItemId] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [foodItem, setFoodItem] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
  });
  const [dailyTotalsByMeal, setDailyTotalsByMeal] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }); 

  const [isSwipeableOpen, setIsSwipeableOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDateSet, setIsDateSet] = useState(false);

  const [openSwipeableId, setOpenSwipeableId] = useState(null);
  const swipeableRefs = useRef({});

  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, width, height, insets);

  // Function to fetch selected date from local storage when screen is first loaded
  useEffect(() => {
    const fetchSelectedDate = async () => {
      try {
        const storedDate = await AsyncStorage.getItem('selectedDate');
        console.log(storedDate);
        if (storedDate) {
          const date = new Date(storedDate);
          setSelectedDate(date);
        } else {
          setSelectedDate(new Date()); // Default to today's date if no stored date
        }
      } catch (error) {
        console.error('Error retrieving selectedDate from AsyncStorage:', error);
      }
    };

    // Listen for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', fetchSelectedDate);

    // Cleanup the listener when the component unmounts or when the screen loses focus
    return unsubscribe;
  }, [navigation]); 

  // Function to confirm when selected date has been set
  useEffect(() => {
    if (selectedDate) {
      setIsDateSet(true); 
    }
  }, [selectedDate]);

  // Function to fetch user's food logs once selected date has been set
  useFocusEffect(
    useCallback(() => {
      if (isDateSet) {
        fetchFoodLogs(selectedDate);
      }
    }, [selectedDate, isDateSet]) 
  );
  
  // Function to convert passed date to YYYY-MM-DD format
  const getDate = (date) => {
    // Return a default value if the date is null or undefined
    if (!date) {
      return ''; 
    }
  
    // Return formatted passed date
    const now = date;
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; 
  };

  // Function to convert current date to YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to fetch user's food logs for selected date
  const fetchFoodLogs = (date) => {
    if (!date) return; // Exit if date is invalid

    // Send request to retrieve user's food logs
    axiosInstance.get(`/api/foodlog/user/${userId}/logs?date=${getDate(date)}`)
      .then(response => {
        setFoodLogs(response.data.foodLogs);
        setDailyTotals(response.data.dailyTotals);
        setDailyTotalsByMeal(response.data.dailyTotalsByMeal);
      }) 
      .catch(error => {
        console.error('Error fetching food logs:', error);
      });
  };

  // Function to save new selected date in local storage
  const resetDate = async () => { 
    await AsyncStorage.setItem('selectedDate', selectedDate.toISOString());
  };

  // Function to update selected date on date change
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      resetDate();
    }
  };

  // Function to delete selected food log using swipeable
  const deleteFoodLog = (foodLogId) => {
    // Close the currently open swipeable, if any
    if (openSwipeableId && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId].close();
    }

    // Prevent multiple deletions at once
    if (isDeleting) {
      return;
    }

    setIsDeleting(true); // Start deletion process

    // Send request to delete food log
    axiosInstance.delete(`/api/foodlog/${foodLogId}`)
      .then(() => {        
        fetchFoodLogs(selectedDate); // Refresh the data and update totals
        setIsSwipeableOpen(false)
      })
      .catch(error => {
        console.error('Error deleting food log:', error);
        setIsDeleting(false);
        setIsSwipeableOpen(false)
      })
      .finally(() => {
        setIsDeleting(false); // Reset deleting state
      });
  };
  
  // Function to handle the opening of a swipeable
  const handleSwipeableOpen = (id) => {
    // Close previously opened Swipeable
    if (openSwipeableId && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId].close();
    }
    // Set the currently opened Swipeable
    setOpenSwipeableId(id);
  };

  // Function to navigate to the 'Add Water' screen
  handleLogWater = () => {
    navigation.navigate('Add Water', { user, selectedDate: selectedDate.toISOString() });
  }

  const handleLogPress = async (log) => {
    // Disable log press while being deleted
    if (isDeleting) {
      return;
    }
    
    // Close open deletes before moving to log details screen
    if (isSwipeableOpen) {
      swipeableRefs.current[openSwipeableId].close();
    }

    try {
      if (log.recipeId) { // If pressed item is a recipe...
          // Send request to retrieve recipe data
          const response = await axiosInstance.get(`/api/foodlog/${log.id}/recipe`);
      
          // Set recipe data to fetchedFoodItem
          const fetchedFoodItem = response.data;
          setFoodItem(fetchedFoodItem);  
          
          // Navigate to 'Logged Recipe Details' screen
          navigation.navigate('Logged Recipe Details', {log, user, recipe: fetchedFoodItem, selectedDate: selectedDate.toISOString() });
          
      } else if (log.foodItemId) { // Otherwise, if not a recipe...
        // Send request to retrieve food item data
          const response = await axiosInstance.get(`/api/foodlog/${log.id}/fooditem`);
      
          // Set food item data to fetchedFoodItem
          const fetchedFoodItem = response.data;
          setFoodItem(fetchedFoodItem);

          // Determine if it is a custom created food item
          if (!fetchedFoodItem.userId) {
            foodType = 'Item From USDA Database';
          } else if (fetchedFoodItem.userId) {
            foodType = `Food Item Created By ${user.firstName}`;
          }
          
          // Navigate to 'Logged Food Details' screen
          navigation.navigate('Logged Food Details', {log, user, foodItem: fetchedFoodItem, selectedDate: selectedDate.toISOString()});
      }
    } catch (error) {
      console.error('Error fetching food item or recipe:', error);
    }
  };

  // Function to handle the pressing of an entire meal section
  const handleMealPress = (selectedMeal) => {
    // Get the nutrient values for the selected meal
    const mealTotals = dailyTotalsByMeal[selectedMeal] || {};
  
    // Navigate to the meal details screen, passing the totals
    navigation.navigate('Meal Details', { selectedMeal, mealTotals, user });
  };

  // Function to handle the pressing of the daily totals section
  const handleTotalPress = () => {
    if (foodLogs.length > 0) {
      // Navigate to the meal details screen, passing the totals
      navigation.navigate('Daily Total Details', { dailyTotals, user });
    }
  };

  // Function to convert a value to the desired display format
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

  // Function to render swipeable delete button for each log entry
  const renderRightActions = (log) => (
    <View style={styles.deleteButtonContainer}>
      <TouchableOpacity 
        onPress={() => deleteFoodLog(log.id)} 
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Display order of meal sections
  const mealSectionsOrder = ['Snack', 'Breakfast', 'Lunch', 'Dinner', 'Water'];

  // Function to organize food logs in order by meal
  const foodLogsByMeal = mealSectionsOrder.reduce((acc, selectedMeal) => {
    acc[selectedMeal] = foodLogs.filter(log => log.selectedMeal=== selectedMeal);
    return acc;
  }, {});

  // Function to render each meal section along with all relevant log entries
  const renderMealSection = (selectedMeal) => {
    const logs = foodLogsByMeal[selectedMeal];

    // Return null if the selected meal is "Water" to prevent any logs from appearing
    if (selectedMeal === 'Water') {
      if (logs.length === 0 && dailyTotals.water === 0) return null; // Do not render if no logs and water total is zero

      return (
        <TouchableOpacity onPress={handleLogWater}>
          <View key={selectedMeal}>
            <View style={styles.mealSection}>
              <View style={styles.foodTitle}>
                <Text style={styles.waterMealHeading}>
                  {selectedMeal.charAt(0) + selectedMeal.slice(1)}
                </Text>
                <Text style={styles.waterHeading}>{Number(dailyTotals.water).toFixed()} oz.</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  
    if (logs.length === 0) return null;
  
    return (
      <View key={selectedMeal}>
        <TouchableOpacity onPress={() => handleMealPress(selectedMeal)}>
          <View style={styles.mealSection}>
            <View style={styles.foodTitle}>
            <Text style={styles.mealHeading}>{selectedMeal.charAt(0) + selectedMeal.slice(1)}</Text>
                <Text style={styles.calHeading}>
                  {Number(dailyTotalsByMeal[selectedMeal]?.calories).toFixed()}
                </Text>
            </View>

            <Text style={styles.mealSubHeading}>
              {selectedMeal === 'Water' ? (
                null
              ) : (
                <> 
                  <Text style={styles.proColor}>   P: </Text>{formatNumber(dailyTotalsByMeal[selectedMeal]?.protein)}g   
                  <Text style={styles.carbColor}>   C: </Text>{formatNumber(dailyTotalsByMeal[selectedMeal]?.carbs)}g  
                  <Text style={styles.fatColor}>   F: </Text>{formatNumber(dailyTotalsByMeal[selectedMeal]?.fat)}g  
                </>
              )}
            </Text>
          </View>
        </TouchableOpacity>
  
        {logs.map((log, index) => (
          <Swipeable
            key={index}
            ref={ref => swipeableRefs.current[log.id] = ref} // Store refs by log.id
            renderRightActions={() => renderRightActions(log)}
            onSwipeableWillOpen={() => {
              // Close any currently open swipeable before this one fully opens
              if (openSwipeableId !== null && openSwipeableId !== log.id) {
                const activeSwipeable = swipeableRefs.current[openSwipeableId];
                if (activeSwipeable) {
                  activeSwipeable.close(); // Close the previously active swipeable
                }
              }
              // Set the new open swipeable ID
              handleSwipeableOpen(log.id); 
              setIsSwipeableOpen(true); // Set swipeable open state
            }}
            onSwipeableWillClose={() => {
              if (openSwipeableId === log.id) {
                setOpenSwipeableId(null); // Reset the open swipeable ID
                setIsSwipeableOpen(false); // Update state to reflect no open swipeables
              }
            }}
          >           
            
            <TouchableOpacity onPress={() => handleLogPress(log)} 
            onPressIn={() => setPressedItemId(log.id)} onPressOut={() => setPressedItemId(null)} activeOpacity={1}
            style={[
            styles.foodLogItem,
            { backgroundColor: pressedItemId === log.id ? colorScheme === 'dark' ? '#545353' 
              : '#fff' : colorScheme === 'dark' ? '#292929' : '#eeedf0' } 
          ]}>
              <View style={styles.foodTitle}>
                  <Text style={styles.nameText}>{log.foodItemName} </Text>
                  <Text style={styles.calLabel}>{(log.calories * log.quantity).toFixed()}</Text>
              </View>
              {selectedMeal === 'Water' ? (
                null
              ) : (
                <>
                <View style={styles.foodTitle}>
                  <Text style={styles.foodLogText}>{log.selectedUnit ? `${log.unitQuantity} ${log.selectedUnit}` : log.unitQuantity.toFixed()}</Text>
                    <Text style={styles.foodLogText}>
                      <Text style={styles.proColor2}>P: </Text>{formatNumber(log.protein * log.quantity)}g
                      <Text style={styles.carbColor}>  C: </Text>{formatNumber(log.carbs * log.quantity)}g
                      <Text style={styles.fatColor}>  F: </Text>{formatNumber(log.fat * log.quantity)}g
                    </Text>
                </View>
                </>
              )}
            </TouchableOpacity>
          </Swipeable>
        ))}
      </View>
    );
  };  

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerHeader}>
        <Text style={styles.heading}>My Log</Text>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => navigation.navigate('Settings', { user })}
        >
          <Icon name="settings-outline" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      

      {selectedDate && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          style={styles.picker}
        />
      )}
      </View>
      <View style={styles.emptySpace}></View>

      {foodLogs.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {mealSectionsOrder.map(selectedMeal => renderMealSection(selectedMeal))}
        </ScrollView>
      ) : (
        <View style={styles.noLogsContainer}>
          {getDate(selectedDate) === getCurrentDate() ? (<Text style={styles.noLogsText}>Press the + button in the 
            bottom navigation bar to start logging food.</Text>)
          : (<Text style={styles.noLogsText}>No logs available for this date.</Text>)}
        </View>
      )}

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={() => handleTotalPress()}>
          <View style={styles.totalsContainer}>
          <View style={styles.foodTitle}>
            <Text style={styles.mealHeading}>Total</Text><Text style={styles.calHeading}>{Number(dailyTotals.calories.toFixed())}</Text>
            </View>

            <Text style={styles.mealSubHeading}>
              <Text style={styles.foodLogText}>
                <Text style={styles.proColor}>   P: </Text>{formatNumber(dailyTotals.protein)}g
                <Text style={styles.carbColor}>  C: </Text>{formatNumber(dailyTotals.carbs)}g
                <Text style={styles.fatColor}>  F: </Text>{formatNumber(dailyTotals.fat)}g
                <Text style={styles.waterServingText}>  W: </Text>{formatNumber(dailyTotals.water)} oz.
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomIconsContainer}>
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => navigation.navigate('Home', { username: user.username })}
        >
          <Icon name="home" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => navigation.navigate('Log Food', { userId: user.id, user: user })}
        >
          <Icon name="add-circle-outline" size={width * .065} color='#5f91f5' />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => navigation.navigate('My Food Log', { userId: user.id, user: user })}
        >
          <Icon name="list" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, width, height, insets) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colorScheme === 'dark' ? '#141414' : '#f7f7f7',
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  innerHeader: {
    borderTopColor: colorScheme === 'dark' ? 'white' : 'black',
    borderBottomWidth: 2,
    borderBottomColor: colorScheme === 'dark' ? 'white' : '#919090',
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
  heading: {
    fontSize: height * .0275,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    top: 15,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  settingsIcon: {
    position: 'absolute',
    top: height * .016,
    right: height * .0235,
    zIndex: 10,
  },
  picker: {
    top: height * -.016,
    marginRight: 'auto',
  },
  listContainer: {
    paddingBottom: height * .021,

  },
  mealSection: {
    marginTop: height * .021,
    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#e0dede',
    borderTopWidth: 1,
    borderTopColor: colorScheme === 'dark' ? 'white' : 'black',
    borderBottomWidth: 1,
    borderBottomColor: colorScheme === 'dark' ? 'white' : 'black',
    paddingVertical: height * .0054,
  },
  mealHeading: {
    fontSize: height * .0235,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    marginBottom: height * .0054,
    paddingTop: height * .0054,
    paddingLeft: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  waterMealHeading: {
    fontSize: height * .0235,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    marginVertical: height * .015,
    paddingLeft: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  calHeading: {
    fontSize: height * .0215,
    fontWeight: 'bold',
    fontFamily: 'VarelaRound-Regular',
    color: '#8438f5',
    marginBottom: height * .0054,
    top: height * .018,
    paddingRight: height * .016,
  },
  waterHeading: {
    fontSize: height * .0215,
    fontWeight: 'bold',
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? '#03fcf4' : '#02d9d1',
    marginVertical: height * .015,
    top: height * .002,
    paddingRight: height * .016,
  },
  mealSubHeading: {
    fontSize: height * .015,
    fontWeight: 'bold',
    fontFamily: 'VarelaRound-Regular',
    paddingLeft: height * .0054,
    paddingBottom: height * .0054,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  foodTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calLabel: {
    textAlign: 'flex-end',
    flexShrink: 0,
    fontSize: height * .0195,
    fontWeight: 'bold',
    fontFamily: 'VarelaRound-Regular',
    paddingBottom: height * .0021,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  nameText: {
    textAlign: 'left',
    flex: 1,
    fontSize: height * .015,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    marginRight: height * .055,
    paddingBottom: height * .0054,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  calColor: {
    color: '#7323eb',
  },
  proColor: {
    color: '#f5cd1b',
  },
  proColor2: {
    color: colorScheme === 'dark' ? '#fad841' : '#e3ca59',
  },
  carbColor: {
    color: '#00aaff',
  },
  fatColor: {
    color: '#eb23dd',
  },
  waterColor: {
    textAlign: 'left',
    color: colorScheme === 'dark' ? '#03fcf4' : '#02d9d1',
  },
  waterServingText: {
    fontWeight: 'bold',
    color: colorScheme === 'dark' ? '#03fcf4' : '#02d9d1',
  },
  servingText: {
    fontWeight: 'bold',
    fontFamily: 'VarelaRound-Regular',
  },
  foodLogItem: {
    padding: height * .0105,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorScheme === 'dark' ? 'white' : 'black',
  },
  foodLogText: { 
    fontSize: height * .0139,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: height * .1,
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colorScheme === 'dark' ? 'white' : 'black',
    zIndex: -1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .0175,
  },
  totalsContainer: {
    paddingTop: height * .0054,
    paddingBottom: height * .01075,
    borderTopWidth: 1.5,
    borderTopColor: colorScheme === 'dark' ? 'white' : 'black',
    borderBottomWidth: 1.5,
    borderBottomColor: colorScheme === 'dark' ? 'white' : 'black',
    paddingVertical: height * .0054,
    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#e0dede',
  },
  noLogsContainer: {
    flex: 1,
    padding: height * .021,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLogsText: {
    fontSize: height * .01925,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'center',
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

export default MyFoodLogScreen;
