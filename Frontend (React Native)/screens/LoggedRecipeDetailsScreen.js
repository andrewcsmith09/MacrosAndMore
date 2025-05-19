import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, 
 KeyboardAvoidingView, Platform, useColorScheme, Dimensions, Keyboard, FlatList } from 'react-native';
import axiosInstance from '../../Config/axios_config';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';

/**
 * LoggedRecipeDetailsScreen
 * 
 * Allows users to view and update the quantity, serving unit, and associated meal for a logged recipe entry.
 * Dynamically calculates and displays detailed nutritional information based on user inputs and the recipe data.
 * Supports editing, saving changes to the backend, deleting the logged entry, and viewing recipe directions in a modal.
 */

const { width, height } = Dimensions.get('window'); 

const LoggedRecipeDetailsScreen = ({ route }) => {
  const navigation = useNavigation();

  const { log: foodLog, user, recipe } = route.params;
  const [recipeItems, setRecipeItems] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(foodLog ? foodLog.selectedUnit : '');
  const [unitItems, setUnitItems] = useState([
    { label: 'serving', value: 'serving' },
    { label: 'batch', value: 'batch' },
  ]);
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
    direction: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFirstSection, setIsFirstSection] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecipeExpanded, setIsRecipeExpanded] = useState(false);
  
  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const styles = dynamicStyles(colorScheme, isFirstSection, insets);
  

  // Function to assign varibles once foodLog and recipe are successfully loaded
  useEffect(() => {
    if (foodLog) {
      setQuantity(foodLog.unitQuantity);
      setSelectedMeal(foodLog.selectedMeal);
    }
    if (recipe) {
      setRecipeItems(recipe.recipeItems || []);
    }
  }, [route.params]);
  
  // Function to update unit labels to singular or plural based on quantity
  useEffect(() => {
    const qty = parseInt(quantity, 10);
    if (!isNaN(qty) && selectedUnit=='serving' || selectedUnit=='servings') {
      setSelectedUnit(qty === 1 ? 'serving' : 'servings');
    } else if (!isNaN(qty) && selectedUnit=='batch' || selectedUnit=='batches') {
      setSelectedUnit(qty === 1 ? 'batch' : 'batches');
    } 
    if (!isNaN(qty)) {
      setUnitItems([
        { label: qty === 1 ? 'serving' : 'servings', value: 'serving' },
        { label: qty === 1 ? 'batch' : 'batches', value: 'batch' },
      ]);
    }
  }, [quantity, selectedUnit]);

  // Function to re-calculate nutritional values when quantity or selected unit are updated
  useEffect(() => {
    if (recipe) {
      // Determine multiplier based on selected serving size unit
      let multiplier = 0;
      if (selectedUnit == 'serving' || selectedUnit == 'servings') {
        multiplier = parseFloat(quantity);
      } else if (selectedUnit == 'batch' || selectedUnit == 'batches') {
        multiplier = parseFloat(quantity * recipe.servingSize);
      }

      // Calculate nutrient values using multiplier
      const newCalories = (recipe.calories/recipe.servingSize) * multiplier;
      const newProtein = (recipe.protein/recipe.servingSize) * multiplier;
      const newCarbs = (recipe.carbs/recipe.servingSize) * multiplier;
      const newFat = (recipe.fat/recipe.servingSize) * multiplier;
      const newTotalSugars = (recipe.totalSugars/recipe.servingSize) * multiplier;
      const newFiber = (recipe.fiber/recipe.servingSize) * multiplier;
      const newCalcium = (recipe.calcium/recipe.servingSize) * multiplier;
      const newIron = (recipe.iron/recipe.servingSize) * multiplier;
      const newSodium = (recipe.sodium/recipe.servingSize) * multiplier;
      const newVitaminA = (recipe.vitaminA/recipe.servingSize) * multiplier;
      const newVitaminC = (recipe.vitaminC/recipe.servingSize) * multiplier;
      const newCholesterol = (recipe.cholesterol/recipe.servingSize) * multiplier;
      const newTransFat = (recipe.transFat/recipe.servingSize) * multiplier;
      const newSaturatedFat = (recipe.saturatedFat/recipe.servingSize) * multiplier;
      const newPolyunsaturatedFat = (recipe.polyunsaturatedFat/recipe.servingSize) * multiplier;
      const newMonounsaturatedFat = (recipe.monounsaturatedFat/recipe.servingSize) * multiplier;
      const newPotassium = (recipe.potassium/recipe.servingSize) * multiplier;
      const newAddedSugars = (recipe.addedSugars/recipe.servingSize) * multiplier;
      const newVitaminD = (recipe.vitaminD/recipe.servingSize) * multiplier;

      setCalculatedValues({
        servingSizeUnit: recipe.servingSizeUnit,
        servingText: recipe.servingText,
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
  }, [quantity, recipe, selectedUnit]);

  // Function to calculate progress percentage
  const calculatePercentage = (value, goal) => {
    if (goal > 0) {
      return ((value / goal) * 100).toFixed(); // Return the percentage formatted to one decimal place
    }
    return '0'; // Return 0 if the goal is 0 to avoid division by zero
  };

  // Function to update logged recipe
  const handleLogFood = () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); // Disable the button by setting loading to true

    if (quantity < 1 || quantity === null) {
      Alert.alert('Quantity is required', 'Please enter the quantity of the food item.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }
    
    let logQuantity = parseFloat(quantity);

    if (selectedUnit === 'batch' || selectedUnit === 'batches') {
      logQuantity *= recipe.servingSize; // Calculate total quantity for batches
    }
  
    // Send update request to backend
    axiosInstance.put(`/api/foodlog/${foodLog.id}/update`, null, {
    params: {
        quantity: logQuantity/recipe.servingSize,
        selectedMeal: selectedMeal,
        selectedUnit: selectedUnit,
        unitQuantity: quantity,
    }
    })
    .then(response => {
        Alert.alert('Log Entry Updated', 'Your changes have been saved.');
        navigation.goBack();
    })
    .catch(error => {
        setIsLoading(false);  // Re-enable the button if validation fails
        console.error('Error updating entry:', error);
    });
  };

  // Function to convert value to desired format
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

  const inputRef = useRef(null);

  // Function to enable keyboard when screen is loaded
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

  // Function to delete logged recipe from food log
  const handleDeleteLoggedFood = () => {
    Alert.alert(
      'Delete Log Entry?',
      'Are you sure you want to delete log entry? It will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          // Send delete request to backend
          onPress: async () => {
            axiosInstance.delete(`/api/foodlog/${foodLog.id}`)
            .then(() => {        
                Alert.alert('Log Entry Deleted', 'Entry has been deleted from log.');
                navigation.goBack();
            })
            .catch(error => {
                console.error('Error deleting log entry', error);
            });
          },
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  // Function to expand or collapse additional nutritional info
  const toggleAdditionalInfo = () => {
    setIsFirstSection(!isFirstSection);
  };

  // Function to open modal that contains recipe directions
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  // Function to close modal that contains recipe directions
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Update recipe food items when recipe is updated or loaded
  useEffect(() => {
    if (recipe && recipe.recipeItems) {
        setRecipeItems(recipe.recipeItems);
    }
  }, [recipe]);

  // Function to manually dismiss the keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss(); 
  };

  return (
    <View style={styles.container}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={height * .039}
    >
    
      <View style={styles.topSafe}></View>
        <View style={styles.innerHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'< Back    '}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>macros<Text style={styles.title2}>&</Text><Text style={styles.title}>more</Text></Text>

          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => navigation.navigate('Settings', { user: user })}
          >
            <Icon name="settings-outline" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardOpeningTime={0}
          extraScrollHeight={415}
          keyboardShouldPersistTaps="handled" 
          contentInset={{ bottom: -10 }}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.detailsContainer}>
            
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.heading}>{recipe ? recipe.recipeName : 'Loading...'}</Text>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.servingText}>{recipe ? recipe.servingSize : ''} Servings Per Batch</Text>
              
              <TouchableOpacity style={styles.detailsButton} activeOpacity={1} 
              onPress={() => {toggleAdditionalInfo(); handleKeyboardDismiss(); setIsRecipeExpanded(false);}}>
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

              
              
              {recipe ? 
                (recipe.direction ? (
                  <TouchableOpacity style={styles.outerDirectionSection} onPress={() => { handleKeyboardDismiss(); setIsFirstSection(true); handleOpenModal();}}>
                    <Text style={styles.directionButtonText}>View Ingredients & Directions</Text>               
                  </TouchableOpacity>) 
                  : 
                  (<TouchableOpacity style={styles.outerDirectionSection} onPress={() => { handleKeyboardDismiss(); setIsFirstSection(true); handleOpenModal();}}>
                    <Text style={styles.directionButtonText}>View Ingredients</Text>
                  </TouchableOpacity>)) 
                : 
                (<TouchableOpacity style={styles.outerDirectionSection} onPress={() => { handleKeyboardDismiss(); setIsFirstSection(true); handleOpenModal();}}>
                    <Text style={styles.directionButtonText}>View Ingredients</Text>
                  </TouchableOpacity>)
              }

               {/* Modal for Directions */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={styles.modalTitle}>Ingredients</Text>
                      <FlatList
                          data={recipeItems}
                          keyExtractor={item => item.recipeItemId.toString()}
                          renderItem={({ item }) => (
                            item.unit === "g" ? ( 
                              <Text style={styles.ingredients}>
                                  • <Text style={styles.name}>{item.foodName}</Text> - {item.unitQuantity}g
                              </Text>
                            ) : 
                            ( <Text style={styles.ingredients}>
                                • <Text style={styles.name}>{item.foodName}</Text> - {item.unitQuantity} {item.unit} ({item.quantity}g)
                              </Text>
                            )
                          )}
                      />
                      <View style={styles.emptySpace}></View>
                      {recipe ? 
                        (recipe.direction ?
                          <>
                            <Text style={styles.modalTitle}>Directions</Text>
                            <Text style={styles.directions}>{recipe ? recipe.direction : null}</Text>
                          </>
                          : null)
                        : null
                      }
                    </ScrollView>
                    <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
          </View>
            
            <Text style={styles.mealText}>Serving:</Text>
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                ref={inputRef}
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity.toString()}
                onChangeText={text => setQuantity(text)}
                returnKeyType='done'
                onFocus={() => { setIsFirstSection(true); setIsRecipeExpanded(false); setIsFocused(true); }}
                onBlur={() => {setIsFocused(false)}}
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

            <View style={styles.mealSelection}>
              <Text style={styles.mealText}>Meal:</Text>
              <View style={styles.mealContainer}>
                <TouchableOpacity style={styles.mealButton} onPress={() => {setSelectedMeal('Breakfast'); handleKeyboardDismiss();}}> 
                  <Text style={{ color: selectedMeal === 'Breakfast' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                    paddingBottom: height * .015, fontFamily: 'VarelaRound-Regular', fontSize: height * .02,
                    }} >Breakfast</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mealButton} onPress={() => {setSelectedMeal('Lunch'); handleKeyboardDismiss();}}>
                  <Text style={{ color: selectedMeal === 'Lunch' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                    paddingBottom: height * .015, fontFamily: 'VarelaRound-Regular', fontSize: height * .02,
                    }}>Lunch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mealButton} onPress={() => {setSelectedMeal('Dinner'); handleKeyboardDismiss();}}>
                  <Text style={{ color: selectedMeal === 'Dinner' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                    paddingBottom: height * .015, fontFamily: 'VarelaRound-Regular', fontSize: height * .02,
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
              <Text style={styles.buttonText}>Update Log Entry</Text>
            </TouchableOpacity>

            {!isFocused ? 
              <TouchableOpacity style={styles.deleteButton} onPress={() => {handleDeleteLoggedFood(); handleKeyboardDismiss();}}>
                <View style={styles.buttonView}>
                  <Icon name="trash" size={height * .017} color="#fe0000" paddingTop={height * .0015}/>
                  <Text style={styles.deleteText}> Delete Log Entry</Text>
                </View>
              </TouchableOpacity>
            : null }

        </KeyboardAwareScrollView>
        </KeyboardAvoidingView>

        <View style={styles.bottomIconsContainer}>
          <TouchableOpacity
            style={styles.bottomIcon}
            onPress={() => navigation.navigate('Home', { username: user.username })}
          >
            <Icon name="home" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'}  />
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
            <Icon name="list" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'}  />
          </TouchableOpacity>
        </View>
        
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
    paddingTop: height * .025,
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
  editIcon: {
    position: 'absolute',
    top: height * .018,
    right: height * .02,
    zIndex: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: height * .016,
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
    paddingBottom: height * .001,
  },
  servingText: {
    fontSize: height * .0172,
    fontFamily: 'VarelaRound-Regular',
    textAlign: 'center',
    paddingBottom: height * .01,
    paddingTop: height * .0032,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  detailsButton: {
    borderRadius: 10,
    paddingVertical: height * .008,
    paddingTop: height * .015,
    paddingBottom: height * .015,
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
    marginTop: height *.01,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  outerDirectionSection: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: height * .008,
  },
  directionButtonText: {
    color: '#8438f5',
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
  },
  innerDirectionSection: {
    height: height * .35,
    justifyContent: 'center',
    bottom: height * .01,
  },
  direction: {
    fontSize: height * .0172,
    fontFamily: 'VarelaRound-Regular',
    paddingBottom: height * .0105,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    minHeight: height * .17,
    maxHeight: height * .65,
    padding: 20,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#f7f7f7',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: height * .022,
    bottom: height * .01,
    paddingTop: height * .01,
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    alignSelf: 'center',
    textDecorationLine: 'underline',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  ingredients: {
    paddingBottom: height * .01,
    fontSize: height * .0155,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  name: {
    fontFamily: 'Quicksand-Bold',
  },
  directions: {
    paddingBottom: height * .01,
    textAlign: 'center',
    fontSize: height * .015,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  closeButton: {
    marginTop: height * .012,
    marginBottom: height * -.01,
    padding: height * .011, 
    paddingHorizontal: height * .03,
    backgroundColor: '#8438f5',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .0172,
  },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: '#ccc',
    height: height * .045,
    padding: height * .0105,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
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
    top: height * .45,
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
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    paddingTop: height * .012,
    paddingBottom: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  mealContainer: {
    alignItems: 'center',
    marginBottom: height * .035,
  },
  button: {
    backgroundColor: '#7323eb',
    padding: height * .011,
    borderRadius: 5,
    alignItems: 'center',
    bottom: height * -.005,
  },
  buttonText: {
      color: '#fff',
      fontSize: height * .0172,
      fontFamily: 'Quicksand-Bold',
  },
  editButton: {
    marginTop: height * .01,
    alignSelf: 'center',
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
  deleteButton: {
    bottom: -35,
    alignSelf: 'center',
  },
  deleteText: {
    color: 'red',
    fontSize: height * .0165,
    fontFamily: 'Quicksand-Bold',
  },
  emptySpace: {
    paddingBottom: height * .015,
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

export default LoggedRecipeDetailsScreen;
