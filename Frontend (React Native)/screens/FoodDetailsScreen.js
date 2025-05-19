import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, 
 Keyboard, KeyboardAvoidingView, Platform, useColorScheme, Dimensions } from 'react-native';
import axiosInstance from '../Config/axios_config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';

/**
 * FoodDetailsScreen
 * 
 * This screen displays the detailed nutritional information of a selected food item.
 * Users can input a quantity and select a serving unit (grams, ounces, or servings),
 * and the screen will calculate and display updated nutrient values based on that input.
 * This screen can be visited by selecting a food item from the log food screen. Once a user
 * logs the food item on this screen, they will automatically navigate to My Food Log screen.
 */

const { width, height } = Dimensions.get('window'); 

const FoodDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { foodItemId, userId, user, selectedDate } = route.params; 
  const [foodItem, setFoodItem] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [selectedUnit, setSelectedUnit] = useState('Loading...');
  const [open, setOpen] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    totalSugars: 0,
    fiber: 0,
    calcium: 0,
    iron: 0,
    sodium: 0,
    vitaminA: 0,
    vitaminC: 0,
    cholesterol: 0,
    transFat: 0,
    saturatedFat: 0,
    polyunsaturatedFat: 0,
    monounsaturatedFat: 0,
    potassium: 0,
    addedSugars: 0,
    vitaminD: 0,
    servingText: '',
    servingSize: 0,
    servingSizeUnit: '',
  });
  const [unitItems, setUnitItems] = useState([
    { label: 'g', value: 'g' },
    { label: 'oz.', value: 'oz.' },
  ]);
  const today = new Date();

  const [isToday, setIsToday] = useState(false); 
  const [isFirstSection, setIsFirstSection] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, isFirstSection, insets, selectedMeal);
  const scrollViewRef = useRef(null);

  // Function to retrieve food item data and initialize serving units when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Determine if selected date is today
      if (getDate(selectedDate) === getDate(today)) {
        setIsToday(true);
      }

      // Send request to retrieve food item data
      axiosInstance.get(`/api/food/${foodItemId}`)
      .then(response => {
        setFoodItem(response.data); // Assign food item data
        
        // Initialize unitItems based on the response
        if (response.data.servingSize) {
          setUnitItems([
            { label: 'g', value: 'g' },
            { label: 'oz.', value: 'oz.' },
            { label: 'serving', value: 'serving' },
          ]);
          setSelectedUnit('serving'); // Set default to serving if available
        } else {
          setUnitItems([
            { label: 'g', value: 'g' },
            { label: 'oz.', value: 'oz.' },
          ]);
          setSelectedUnit('oz.'); // Default to ounces
        }
      })
      .catch(error => {
        console.error('Error fetching food item details:', error);
      });
    });

    return unsubscribe;
  }, [navigation, foodItemId]);
  
  // Function to update serving units when quantity or food item changes
  useEffect(() => {
    const qty = parseInt(quantity, 10);
    
    if (!isNaN(qty)) {
      // Update selectedUnit based on quantity
      if (foodItem && foodItem.servingSize) {
        setUnitItems([
          { label: qty === 1 ? 'serving' : 'servings', value: 'serving' },
          { label: 'g', value: 'g' },
          { label: 'oz.', value: 'oz.' },
        ]);
      } else {
        setUnitItems([
          { label: 'g', value: 'g' },
          { label: 'oz.', value: 'oz.' },
        ]);
      }
  
      // Only update selectedUnit if it’s not already set to a new valid value
      if (selectedUnit === 'serving' || selectedUnit === 'servings') {
        setSelectedUnit(qty === 1 ? 'serving' : 'servings');
      }
    }
  }, [quantity, foodItem]);
  
  // Function to handle unit selection from dropdown
  const handleUnitSelect = (value) => {
    setSelectedUnit(value); // Update the selected unit when user makes a selection
    setOpen(false); // Close the dropdown after selection
  };

  // Function to calculate nutritional values based on selected serving unit
  useEffect(() => {
    if (foodItem) {
      let multiplier = parseFloat(quantity);
      if (selectedUnit === 'oz.') {
        multiplier *= 28.3495; // Convert grams to ounces
      } else if (selectedUnit === 'serving' || selectedUnit === 'servings') {
        multiplier *= foodItem.servingSize; // Calculate serving size values based on grams
      }

      // Multiply nutritional values by serving size
      const newCalories = foodItem.calories * multiplier;
      const newProtein = foodItem.protein * multiplier;
      const newCarbs = foodItem.carbs * multiplier;
      const newFat = foodItem.fat * multiplier;
      const newTotalSugars = foodItem.totalSugars * multiplier;
      const newFiber = foodItem.fiber * multiplier;
      const newCalcium = foodItem.calcium * multiplier;
      const newIron = foodItem.iron * multiplier;
      const newSodium = foodItem.sodium * multiplier;
      const newVitaminA = foodItem.vitaminA * multiplier;
      const newVitaminC = foodItem.vitaminC * multiplier;
      const newCholesterol = foodItem.cholesterol * multiplier;
      const newTransFat = foodItem.transFat * multiplier;
      const newSaturatedFat = foodItem.saturatedFat * multiplier;
      const newPolyunsaturatedFat = foodItem.polyunsaturatedFat * multiplier;
      const newMonounsaturatedFat = foodItem.monounsaturatedFat * multiplier;
      const newPotassium = foodItem.potassium * multiplier;
      const newAddedSugars = foodItem.addedSugars * multiplier;
      const newVitaminD = foodItem.vitaminD * multiplier;

      setCalculatedValues({
        servingSize: foodItem.servingSize,
        servingSizeUnit: foodItem.servingSizeUnit,
        servingText: foodItem.servingText,
        calories: newCalories || 0,
        protein: newProtein || 0,
        carbs: newCarbs || 0,
        fat: newFat || 0,
        totalSugars: newTotalSugars || 0,
        fiber: newFiber || 0,
        calcium: newCalcium || 0,
        iron: newIron || 0,
        sodium: newSodium || 0,
        vitaminC: newVitaminC || 0,
        cholesterol: newCholesterol || 0,
        transFat: newTransFat || 0,
        saturatedFat: newSaturatedFat || 0,
        polyunsaturatedFat: newPolyunsaturatedFat || 0,
        monounsaturatedFat: newMonounsaturatedFat || 0,
        potassium: newPotassium || 0,
        addedSugars: newAddedSugars || 0,
        vitaminA: newVitaminA || 0,
        vitaminD: newVitaminD || 0,
      });
    }
  }, [quantity, foodItem, selectedUnit]);

  // Function to convert passed date to YYYY-MM-DD format
  const getDate = (date) => {
    const now = date ? new Date(date) : new Date(); 
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Pass selected date to getDate function
  const date = getDate(selectedDate);

  // Function to convert date to calendar format (Month Day, Year)
  const formatDateToStandard = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `${monthNames[month - 1]} ${day}, ${year}`;
  };

  // Function to retrieve current time in HH:MM:SS format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Function to add food item to food log for selected date
  const handleLogFood = () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); 

    // Ensure quantity is provided
    if (quantity.trim() === '') {
      Alert.alert('Quantity is required', 'Please enter the quantity of the food item.');
      setIsLoading(false);  
      return;
    }

    // Ensure food info is finished loading
    if (selectedUnit === 'Loading...') {
      Alert.alert('Info Still Loading', 'Food information needs to finsh loading before saving to food log.');
      setIsLoading(false);  
      return;
    }
  
    let logQuantity = parseFloat(quantity);
  
    // Determine quantity to be logged based on selected serving size unit
    switch (selectedUnit) {
      case 'oz.':
        logQuantity *= 28.3495;
        break;
      case 'serving':
        logQuantity *= calculatedValues.servingSize;
        break;
      case 'servings':
        logQuantity *= calculatedValues.servingSize;
        break;
      default:
        break;
    }
  
    // Prepare post data
    const logData = {
      userId: userId,
      foodItemId: foodItemId,
      quantity: logQuantity,
      logDate: date,
      logTime: getCurrentTime(),
      selectedMeal: selectedMeal,
      selectedUnit: selectedUnit,
      unitQuantity: quantity
    };

    // Send post request to log food item
    axiosInstance.post('/api/foodlog/log', logData)
      .then(response => {
        Alert.alert('Food logged successfully', 'Continue searching to add more');
        navigation.goBack();
      })
      .catch(error => {
        console.error('Error logging food:', error);
        setIsLoading(false);  
      });
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
  };

  // Function to calculate progress percentage
  const calculatePercentage = (value, goal) => {
    // If goal exists, return the percentage formatted to one decimal place
    if (goal > 0) {
      return ((value / goal) * 100).toFixed();
    }
    // Return 0 if the goal is 0 to avoid division by zero
    return '0';
  };

  // Function to collapse or expand additional nutritional info
  const toggleAdditionalInfo = () => {
    setIsFirstSection(!isFirstSection);
  };

  // Function to determine serving text based on availability of servingText and servingSize
  const getServingDescription = () => {
    if (foodItem) {
      if(foodItem.userId) {
      const { servingText, servingSizeUnit } = calculatedValues;
        if (servingText && foodItem.originalServingSize) {
          return `${servingText} (${foodItem.originalServingSize} ${servingSizeUnit})`;
        } else if (servingText) {
          return servingText;
        } else if (foodItem.originalServingSize) {
          return `${foodItem.originalServingSize} ${servingSizeUnit}`;
        } else {
          return 'Per Gram';
        }
      } else {
        const { servingText, servingSize, servingSizeUnit } = calculatedValues;
        if (servingText && servingSize) {
          return `${servingText} (${servingSize} ${servingSizeUnit})`;
        } else if (servingText) {
          return servingText;
        } else if (servingSize) {
          return `${servingSize} ${servingSizeUnit}`;
        } else {
          return 'Per Gram';
        }
      }
    }
  };

  const inputRef = useRef(null);

  // Function to enable keyboard when screen comes into focus
  useEffect(() => {
    // Focus the input field to make the keyboard appear
    if (inputRef.current) {
      inputRef.current.focus();

      // Set a timeout to dismiss the keyboard shortly after focusing
      setTimeout(() => {
        Keyboard.dismiss();
      }, 1);
    }
  }, []);

  // Function to navigate to 'Update Food Item' screen
  const handleEditCustomFood = () => {
    navigation.navigate('Update Food Item', { user, foodItemId });
  }

  // Function to delete custom created food item from database
  const handleDeleteCustomFood = () => {
    Alert.alert(
      'Delete Custom Food?',
      'Are you sure you want to delete custom food item? It will be permanently deleted. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            axiosInstance.delete(`/api/food/${foodItemId}`)
            .then(response => {
              Alert.alert('Custom Food Deleted', 'Custom food item successfully deleted.');
              navigation.goBack();
            })
            .catch(error => {
              console.error('Error Deleting Food :', error);
            });
          },
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  // Function to manually dismiss the keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss(); 
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
       <View style={{ flex: 1 }}>
         <View style={styles.topSafe}></View>
          <View style={styles.innerHeader}>
            <TouchableOpacity style={styles.mealButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>{'< Back    '}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>macros<Text style={styles.title2}>&</Text><Text style={styles.title}>more</Text></Text>

            {foodItem ? (foodItem.userId ? 
              <TouchableOpacity style={styles.editIcon} onPress={() => {handleEditCustomFood(); handleKeyboardDismiss();}}>
                <View style={styles.buttonView}>
                  <Icon name="pencil" size={height * .016} color="#8438f5" paddingTop={height * .0035}/>
                  <Text style={styles.editText}> Edit</Text>
                </View>
              </TouchableOpacity>
             :
              <TouchableOpacity
                style={styles.settingsIcon}
                onPress={() => navigation.navigate('Settings', { user: user })}
              >
                <Icon name="settings-outline" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>
            ) :
              <TouchableOpacity
                style={styles.settingsIcon}
                onPress={() => navigation.navigate('Settings', { user: user })}
              >
                <Icon name="settings-outline" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>}

          </View>

          <KeyboardAwareScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardOpeningTime={0}
            extraScrollHeight={410}
            keyboardShouldPersistTaps="handled" 
            contentInset={{ bottom: -10 }}
          >
            
            <View style={styles.detailsContainer}>
              {foodItem ? (foodItem.userId ? 
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.heading}>{foodItem ? foodItem.name : 'Loading...'}</Text> :
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.heading}>{foodItem ? foodItem.name : 'Loading...'}</Text>) : 
              <Text style={styles.heading}>Loading...</Text>}
              {foodItem ? (foodItem.userId ? 
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.servingText}>Serving Size: {getServingDescription()}</Text> :
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.servingText}>Serving Size: {getServingDescription()}</Text>) : null}
              
              <TouchableOpacity style={styles.detailsButton} activeOpacity={1} 
              onPress={() => {toggleAdditionalInfo(); handleKeyboardDismiss();}}>
                {isFirstSection ? (
                  <View>
                    <View style={styles.detailsRow}>
                        <Text style={styles.details}>Calories: </Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.detailValues}>{calculatedValues.calories.toFixed()}</Text>    
                            <Text style={styles.detailsPercent2}>{calculatePercentage(calculatedValues.calories, user.dailyCalorieGoal)}%</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <Text style={styles.details}>Protein: </Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.detailValues}>{formatNumber(calculatedValues.protein)} g</Text>
                            <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.protein, user.dailyProteinGoal)}%</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <Text style={styles.details}>Total Carbs:</Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.detailValues}>{formatNumber(calculatedValues.carbs)} g</Text>
                            <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.carbs, user.dailyCarbsGoal)}%</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Total Fat:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.fat)} g</Text>
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.fat, user.dailyFatGoal)}%</Text>
                      </View>
                    </View>

                  </View>
                ) : (
                  <View>
                    <View style={styles.detailsRow}>
                        <Text style={styles.details}>Calories: </Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.detailValues}>{calculatedValues.calories.toFixed()}</Text>    
                            <Text style={styles.detailsPercent2}>{calculatePercentage(calculatedValues.calories, user.dailyCalorieGoal)}%</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <Text style={styles.details}>Protein: </Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.detailValues}>{formatNumber(calculatedValues.protein)} g</Text>
                            <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.protein, user.dailyProteinGoal)}%</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <Text style={styles.details}>Total Carbs:</Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.detailValues}>{formatNumber(calculatedValues.carbs)} g</Text>
                            <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.carbs, user.dailyCarbsGoal)}%</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details2}>Fiber:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues2}>{formatNumber(calculatedValues.fiber)} g</Text> 
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.fiber, user.fiber)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details2}>Total Sugars:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues2}>{formatNumber(calculatedValues.totalSugars)} g</Text>
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.totalSugars, user.totalSugars)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details2}>Added Sugars:</Text>
                          <View style={styles.valueContainer}>
                          <Text style={styles.detailValues2}>{formatNumber(calculatedValues.addedSugars)} g</Text>
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.addedSugars, user.addedSugars)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Total Fat:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.fat)} g</Text>
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.fat, user.dailyFatGoal)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details2}>Saturated Fat:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues2}>{formatNumber(calculatedValues.saturatedFat)} g</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.saturatedFat, user.saturatedFat)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details2}>Trans Fat:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues2}>{formatNumber(calculatedValues.transFat)} g</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.transFat, user.transFat)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details2}>Polyunsaturated Fat:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues2}>{formatNumber(calculatedValues.polyunsaturatedFat)} g</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.polyunsaturatedFat, user.polyunsaturatedFat)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details2}>Monounsaturated Fat:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues2}>{formatNumber(calculatedValues.monounsaturatedFat)} g</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.monounsaturatedFat, user.monounsaturatedFat)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Cholesterol:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.cholesterol)} mg</Text>
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.cholesterol, user.cholesterol)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Sodium:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.sodium)} mg</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.sodium, user.sodium)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Potassium:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.potassium)} mg</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.potassium, user.potassium)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Calcium:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.calcium)} mg</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.calcium, user.calcium)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Iron:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.iron)} mg</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.iron, user.iron)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Vitamin A:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.vitaminA)} mcg</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.vitaminA, user.vitaminA)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Vitamin C:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.vitaminC)} mg</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.vitaminC, user.vitaminC)}%</Text>
                      </View>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.details}>Vitamin D:</Text>
                      <View style={styles.valueContainer}>
                          <Text style={styles.detailValues}>{formatNumber(calculatedValues.vitaminD)} mcg</Text>    
                          <Text style={styles.detailsPercent}>{calculatePercentage(calculatedValues.vitaminD, user.vitaminD)}%</Text>
                      </View>
                    </View>
                  </View>
                )}

                <Text style={styles.moreInfoText}>{isFirstSection ? 'More Info' : 'Less Info'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.servingSection}>
              <Text style={styles.mealText}>Serving:</Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  ref={inputRef}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={text => setQuantity(text)}
                  returnKeyType='done'
                  onFocus={() => {setIsFirstSection(true); setIsFocused(true);}}
                  onBlur={() => setIsFocused(false)}
                />
                <TouchableOpacity style={styles.dropdownWrapper} onPress={() => {setOpen(true); handleKeyboardDismiss();}}>
                  <View style={styles.dropdownButton}>
                    <Text style={styles.unitText}>{selectedUnit}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {open && (
                <Modal transparent={true} animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
                  <TouchableOpacity style={styles.backdrop} onPress={() => {setOpen(false); handleKeyboardDismiss();}}>
                    <View style={styles.dropdownContainer}>
                      <DropDownPicker
                        open={open}
                        value={selectedUnit}
                        items={unitItems}
                        setOpen={setOpen}
                        setValue={item => {
                          setSelectedUnit(item);
                          setOpen(false);
                        }}
                        containerStyle={styles.dropdown}
                        style={styles.dropdownStyle}
                        dropDownContainerStyle={styles.dropdownStyle}
                        labelStyle={styles.dropdownLabel}
                        textStyle={styles.dropdownLabel}
                        arrowIconContainerStyle={styles.dropdownLabel}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>

            <View style={styles.mealSelection}>
              <Text style={styles.mealText}>Meal:</Text>
              <View style={styles.mealContainer}>
                <TouchableOpacity style={styles.mealButton} onPress={() => {setSelectedMeal('Breakfast'); handleKeyboardDismiss();}}> 
                  <Text style={{ color: selectedMeal === 'Breakfast' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                    paddingBottom: height * .02, fontFamily: 'VarelaRound-Regular', fontSize: height * .02,
                    }} >Breakfast</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mealButton} onPress={() => {setSelectedMeal('Lunch'); handleKeyboardDismiss();}}>
                  <Text style={{ color: selectedMeal === 'Lunch' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                    paddingBottom: height * .02, fontFamily: 'VarelaRound-Regular', fontSize: height * .02,
                    }}>Lunch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mealButton} onPress={() => {setSelectedMeal('Dinner'); handleKeyboardDismiss();}}>
                  <Text style={{ color: selectedMeal === 'Dinner' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                    paddingBottom: height * .02, fontFamily: 'VarelaRound-Regular', fontSize: height * .02,
                    }}>Dinner</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mealButton} onPress={() => {setSelectedMeal('Snack'); handleKeyboardDismiss();}}>
                  <Text style={{ color: selectedMeal === 'Snack' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                    paddingBottom: height * .015, fontFamily: 'VarelaRound-Regular', fontSize: height * .02,
                    }}>Snack</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
              onPress={() => {handleLogFood(); handleKeyboardDismiss();}}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isToday ? "Add To Today's Food Log" : `Log For ${formatDateToStandard(date)}`}</Text>
            </TouchableOpacity>

            {foodItem ? 
              (foodItem.userId ? 
                (!isFocused ?
                  <View>              
                    <TouchableOpacity style={styles.deleteButton} onPress={() => {handleDeleteCustomFood(); handleKeyboardDismiss();}}>
                      <View style={styles.buttonView}>
                        <Icon name="trash" size={height * .017} color="#fe0000" paddingTop={height * .0015}/>
                        <Text style={styles.deleteText}> Delete Custom Food</Text>
                      </View>
                    </TouchableOpacity> 
                  </View>
                : null)
            : null) : null}

            <View style={styles.emptySpace}></View>
            
            </KeyboardAwareScrollView>
          </View>
        </KeyboardAvoidingView>
          

      <View style={styles.bottomIconsContainer}>
        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => navigation.navigate('Home', { username: user.username })}
        >
          <Icon name="home" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => navigation.navigate('Log Food', { user: user })}
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

const dynamicStyles = (colorScheme, isFirstSection, insets, selectedMeal) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  innerHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: height * .03215,
  },
  backButton: {
    top: height * .018,
    right: width * .39,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .018,
    color: '#8438f5',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : '#7323eb',
    fontSize: height * .0365,
    top: height * -.015,
    marginBottom: height * -.035,
  },
  title2: {
      textAlign: 'center',
      fontFamily: 'RoundedMplus1c-Bold',
      color: colorScheme === 'dark' ? 'white' : '#7323eb',
      fontSize: height * .028,
  },
  settingsIcon: {
    position: 'absolute',
    top: height * .016,
    right: height * .0235,
    zIndex: 10,
  },
  editIcon: {
    position: 'absolute',
    top: height * .018,
    right: height * .02,
    zIndex: 10,
  },
  editText: {
    color: '#8438f5',
    fontSize: height * .0165,
    fontSize: height * .018,
    fontFamily: 'Quicksand-Bold',
  },
  buttonView: {
    flexDirection: 'row',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 15,
    padding: height * .016,
    paddingBottom: isFirstSection ? height * .04 : height * .175,
    zIndex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  detailsContainer: {
    marginTop: height * -.01,
    paddingHorizontal: 20,
  }, 
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: height * .0007,
  },
  heading: {
    fontSize: height * .0193,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  servingText: {
    fontSize: height * .0172,
    fontFamily: 'VarelaRound-Regular',
    textAlign: 'center',
    paddingBottom: height * .0325,
    paddingTop: height * .0032,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  details: {
    fontSize: height * .0172,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'left',
    paddingTop: height * .001,
    paddingBottom: height * .009,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  details2: {
    fontSize: height * .0172,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'left',
    paddingLeft: height * .035,
    paddingTop: height * .001,
    paddingBottom: height * .009,
    color: colorScheme === 'dark' ? '#cfcfcf' : '#404040',
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  detailValues: {
    fontSize: height * .0172,
    fontFamily: 'RoundedMplus1c-Bold',
    textAlign: 'right',
    paddingBottom: height * .009,
    width: 100,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  detailValues2: {
    fontSize: height * .0172,
    fontFamily: 'RoundedMplus1c-Bold',
    width: 100, 
    textAlign: 'right',
    paddingBottom: height * .009,
    color: colorScheme === 'dark' ? '#cfcfcf' : '#404040',
  },
  detailsPercent: {
    fontSize: height * .018,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? '#c9c9c9' : '#706f6f',
    width: width * .14,
    top: height * .0012,
    textAlign: 'right',
  },
  detailsPercent2: {
    fontSize: height * .018,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? '#c9c9c9' : '#706f6f',
    width: width * .14,
    textAlign: 'right',
  },
  moreInfoText: {
    color: '#8438f5',
    fontSize: height * .0165,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: height * .01,
  },
  servingSection: {
    marginTop: height * .015,
  },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: '#ccc',
    height: height * .045,
    padding: height * .0105,
    borderRadius: 4,
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .017,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  halfInput: {
    flex: 1,
    marginRight: height * .011,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    height: height * .045,
    padding: height * .01,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
  unitText: {
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .016,
    fontFamily: 'Quicksand-Bold',
  },
  dropdownArrow: {
    marginLeft:  height * .011,
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .015,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    marginHorizontal: width * .285,
    top: height * .4,
    alignSelf: 'center',
    zIndex: 10,
  },
  dropdown: {
    width: '111%',
  },
  dropdownStyle: {
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
    borderWidth: .5,
    borderColor: colorScheme === 'dark' ? 'white' : 'black',
    borderRadius: 4,
  },
  dropdownLabel: {
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'Quicksand-Bold',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * .011,
  },
  mealSelection: {
    marginTop: height * .0215,
  },
  mealText: {
    fontSize: height * .0172,
    fontFamily: 'Quicksand-Bold',
    paddingTop: height * .012,
    paddingBottom: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  mealContainer: {
    alignItems: 'center',
    marginBottom: height * .05,
  },
  mealButtonText: {
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .0193,
  },
  button: {
    backgroundColor: '#7323eb',
    padding: height * .011,
    borderRadius: 5,
    alignItems: 'center',
    bottom: height * .011,
  },
  buttonText: {
      color: '#fff',
      fontSize: height * .0172,
      fontFamily: 'Quicksand-Bold'
  },
  buttonView: {
    flexDirection: 'row',
  },
  deleteButton: {
    bottom: -60,
    position:'absolute',
    alignSelf: 'center',
  },
  deleteText: {
    color: 'red',
    fontSize: height * .0165,
    fontFamily: 'Quicksand-Bold',
  },
  emptySpace: {
    backgroundColor: 'transparent',
    opacity: 0,
    zIndex: -1,
  },
  bottomIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderColor: colorScheme === 'dark' ? 'lightgrey' : '#919090',
    paddingVertical: height * .015,
    paddingBottom: insets.bottom === 0 ? height * .015 : insets.bottom - height * .005,
    position: 'absolute',
    bottom: 0,
    backgroundColor: colorScheme === 'dark' ? 'black' : '#e0dede',
  },
  bottomIcon: {
    alignItems: 'center',
  },
});

export default FoodDetailsScreen;
