import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Modal,
 KeyboardAvoidingView, Platform, useColorScheme, Dimensions, Keyboard } from 'react-native';
import axiosInstance from '../../Config/axios_config';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DropDownPicker from 'react-native-dropdown-picker';

/**
 * RecipeFoodDetailsScreen
 *
 * This screen displays detailed nutritional information for a selected food item
 * and allows the user to specify a quantity and unit of measurement before adding
 * the item to a custom recipe. Nutritional values are dynamically calculated based
 * on the selected quantity and unit. Once the quantity has been selected, the user adds 
 * the food item to the recipe and automatically navigates back to Add New Recipe screen.
 */

const { width, height } = Dimensions.get('window'); 

const RecipeFoodDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { foodItemId, userId, user, recipe } = route.params;
  const [foodItem, setFoodItem] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('Loading...');
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

  const [isLoading, setIsLoading] = useState(false);
  const [isFirstSection, setIsFirstSection] = useState(true);

  const [open, setOpen] = useState(false);
  const scrollViewRef = useRef(null);

  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); 
  const styles = dynamicStyles(colorScheme, isFirstSection, insets);

  // Function to retrieve food item and initialize serving units
  useEffect(() => {
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
  }, [foodItemId]);
  
  // Function to update serving units whenever quantity changes 
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
  
      // Update to singular or plural based on quantity
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
        multiplier *= 28.3495; // Convert ounces to grams
      } else if (selectedUnit === 'serving' || selectedUnit === 'servings') {
        multiplier *= foodItem.servingSize;
      }

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
        servingSize: foodItem.servingSize || 0,
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
        vitaminA: newVitaminA || 0,
        vitaminC: newVitaminC || 0,
        cholesterol: newCholesterol || 0,
        transFat: newTransFat || 0,
        saturatedFat: newSaturatedFat || 0,
        polyunsaturatedFat: newPolyunsaturatedFat || 0,
        monounsaturatedFat: newMonounsaturatedFat || 0,
        potassium: newPotassium || 0,
        addedSugars: newAddedSugars || 0,
        vitaminD: newVitaminD || 0,
      });
    }
  }, [quantity, foodItem, selectedUnit]);

  // Function to add food item to recipe
  const handleLogFoodItem = () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); 

    // Ensure quantity is provided
    if (quantity.trim() === '' || quantity < 1) {
      Alert.alert('Amount is required', 'Please enter an amount of 1 or more.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }
  
    let logQuantity = parseFloat(quantity);
  
    // Determine serving quantity for logging purposes
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
    const recipeItemData = {
      foodItemId: foodItemId,
      foodName: foodItem.name,
      quantity: logQuantity,
      unit: selectedUnit,
      unitQuantity: quantity,
    };
    // Send request to add food item to recipe
    axiosInstance.post(`/api/recipes/${recipe.recipeId}/items`, recipeItemData)
      .then(response => {
        navigation.navigate('New Recipe Screen', { recipeId: recipe.recipeId, user });
      })
      .catch(error => {
        setIsLoading(false);
        console.error('Error logging food:', error);
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
    if (goal > 0) {
      return ((value / goal) * 100).toFixed(); // Return the percentage formatted to one decimal place
    }
    return '0'; // Return 0 if the goal is 0 to avoid division by zero
  };

  // Function to expand or collapse additional nutritional info section
  const toggleAdditionalInfo = () => {
    setIsFirstSection(!isFirstSection);
  };

  // Function to manually dismiss the keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss(); 
  };

  // Function to determine serving text based on availability of servingText and servingSize
  const getServingDescription = () => {
    const { servingText, servingSize, servingSizeUnit } = calculatedValues;
    if (servingText && servingSize) {
      return `${servingText} (${servingSize}${servingSizeUnit})`;
    } else if (servingText) {
      return servingText;
    } else if (servingSize) {
      return `${servingSize}${servingSizeUnit}`;
    } else {
      return 'Per Gram';
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.topSafe}></View>
        <View style={styles.innerHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'< Back    '}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>macros<Text style={styles.title2}>&</Text><Text style={styles.title}>more</Text></Text>          
        </View>

        <KeyboardAwareScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardOpeningTime={0}
            keyboardShouldPersistTaps="handled" 
            contentInset={{ bottom: -30 }}
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.detailsContainer}>
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.heading}>{foodItem ? foodItem.name : 'Loading...'}</Text>
              <Text style={styles.servingText}>Serving Size: {getServingDescription()}</Text>
              
              <TouchableOpacity style={styles.detailsButton} activeOpacity={1} onPress={() => {toggleAdditionalInfo(); handleKeyboardDismiss();}}>
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
            
            <Text style={styles.amountText}>Amount:</Text>
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={text => setQuantity(text)}
                returnKeyType='done'
                onFocus={() => setIsFirstSection(true)}
              />
              <TouchableOpacity style={styles.dropdownWrapper} onPress={() => setOpen(true)}>
                <View style={styles.dropdownButton}>
                  <Text style={styles.unitText}>{selectedUnit}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </View>
              </TouchableOpacity>
            </View>

            {open && (
              <Modal transparent={true} animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={styles.backdrop} onPress={() => setOpen(false)}>
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
            <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
             onPress={() => {handleLogFoodItem(); handleKeyboardDismiss();}}
             disabled={isLoading}
            >
              <Text style={styles.buttonText}>Add To Recipe</Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
    </View>
  );
};

const dynamicStyles = (colorScheme, isFirstSection, insets) => StyleSheet.create({
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
  heading: {
    fontSize: height * .0193,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  settingsIcon: {
    position: 'absolute',
    top: height * .016,
    right: height * .0235,
    zIndex: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 15,
    padding: height * .016,
    paddingBottom: isFirstSection ? height * .052 : height * .175,
    zIndex: 1,
  },
  detailsContainer: {
    marginTop: height * -.01,
    paddingHorizontal: 20,
  }, 
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: height * .003,
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
  amountText: {
    fontSize: height * .0172,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    paddingTop: height * .012,
    paddingBottom: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    fontFamily: 'Quicksand-Bold',
    borderColor: '#ccc',
    height: height * .045,
    padding: height * .0105,
    borderRadius: 4,
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  halfInput: {
    flex: 1,
    marginRight: height * .011,
    fontSize: height * .017,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  moreInfoText: {
    color: '#8438f5',
    fontSize: height * .0165,
    marginTop: height *.01,
    marginBottom: !isFirstSection ? height * .075 : 0,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * .011,
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
  button: {
    backgroundColor: '#7323eb',
    padding: height * .011,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: height * .035,
    bottom: height * .011,
  },
  buttonText: {
      color: '#fff',
      fontSize: height * .0172,
      fontFamily: 'Quicksand-Bold'
  },
  emptySpace: {
    backgroundColor: 'transparent',
    opacity: 0,
    zIndex: -1,
  },
});

export default RecipeFoodDetailsScreen;
