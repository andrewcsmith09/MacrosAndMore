import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert, useColorScheme,
 TouchableOpacity, Keyboard, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../Config/axios_config';
import { Swipeable } from 'react-native-gesture-handler';

/**
 * AddNewRecipeScreen
 *
 * Allows users to create a new recipe or edit an existing one.
 * Users can enter or update the recipe's name, direction, serving size, and ingredients.
 * Food items (ingredients) can be viewed, added, or deleted from the recipe.
 * The screen supports saving, discarding (for new recipes), or reverting changes (for existing recipes).
 * Features include swipe-to-delete for ingredients, dynamic nutrition calculation, and auto-collapsing inputs when focused.
 */

const AddNewRecipeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { recipeId, user } = route.params;
  const [recipe, setRecipe] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [recipeName, setRecipeName] = useState('');
  const [direction, setDirection] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [servingSize, setServingSize] = useState('');
  const [recipeState, setRecipeState] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeSwipeableId, setActiveSwipeableId] = useState(null);
  const swipeableRefs = useRef([]);
  const originalRecipeRef = useRef(null);
  const [showIngredients, setShowIngredients] = useState(true);

  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window'); 
  const colorScheme = useColorScheme();
  const [inputFocused, setInputFocused] = useState(false);
  const styles = dynamicStyles(colorScheme, inputFocused, insets, width, height);
  
  // Function to fetch recipe details
  const fetchRecipeDetails = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/recipes/${recipeId}`);
      const recipe = response.data;
      
      // Save original recipe info before editing
      if (!originalRecipeRef.current) {
        originalRecipeRef.current = recipe; // Only set on the first load
      }

      // Update state with recipe details
      setRecipeName(recipe.recipeName);
      setServingSize(recipe.servingSize ? recipe.servingSize.toString() : '');
      setDirection(recipe.direction);
      setFoodItems(recipe.recipeItems); 
      setRecipe(response.data);
      setRecipeState(recipe.state);
      setIsDeleting(false); // Reset delete button

    } catch (error) {
      console.error('Error fetching recipe details:', error);
      Alert.alert('Error', 'Failed to load recipe details');
    }
  }, [recipeId]);

  // Fetch recipe data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchRecipeDetails();
    }, [fetchRecipeDetails])
  );

  // Function to add an ingredient to the current recipe
  const handleAddItem = async () => {
    // Make sure necessary fields are filled out
    if (!servingSize || !recipeName || servingSize < 1) {
      Alert.alert('Missing Information', 'Please fill out recipe name and a valid number of servings (1 or more) before adding items.');
      return;

    } else {
        try {
          // Update recipe details
          await axiosInstance.put(`/api/recipes/${recipeId}`, { userId: user.id, recipeName, direction, servingSize, state: recipeState });
  
          // Pass updated state directly to the next screen
          navigation.navigate('Add Recipe Item', { recipe: { recipeId, recipeName, direction, servingSize, recipeItems: foodItems }, user });
        } catch (error) {
          console.error('Error saving recipe:', error);
          Alert.alert('Error', 'Failed to save recipe');
        }
      }
  }; 

  // Function to save the recipe
  const handleSaveRecipe = async () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); // Disable the button by setting loading to true

    // Ensure necessary fields are filled out
    if (!servingSize || !recipeName || foodItems.length === 0 || servingSize < 1) {
      Alert.alert('Invalid Info', 'You must fill out name, serving size (1 or more), and add ingredients before saving.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;   
    } else {
        try {
          // Send request to update recipe details
          await axiosInstance.put(`/api/recipes/${recipeId}`, { userId: user.id, recipeName, direction, servingSize, state: 'saved' });
          Alert.alert('Success', 'Recipe saved successfully.');
          navigation.navigate('Log Food', { user }); // Navigate back to log food screen
        } catch (error) {
          console.error('Error saving recipe:', error);
          setIsLoading(false);  // Re-enable the button if validation fails
          Alert.alert('Error', 'Failed to save recipe');
        }
    }
  };

  // Function to discard changes or delete recipe and navigate to previous screen  
  const handleDeleteRecipe = async () => {
    Alert.alert(
        'Discard Changes?',
        'Are you sure you want to leave screen? Changes will not be saved.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Discard',
            onPress: async () => {
              // If new recipe, delete completely
              if (recipe.state === 'new') {
                try {
                  axiosInstance.delete(`/api/recipes/${recipeId}`); 
                  } catch (error) {
                    console.error('Error deleting recipe:', error);
                  }
                } else {
                  // If recipe already existed, set to original recipe data
                  setRecipeName(originalRecipeRef.current.recipeName);
                  setDirection(originalRecipeRef.current.direction || '');
                  setFoodItems(originalRecipeRef.current.recipeItems);
                  setServingSize(originalRecipeRef.current.servingSize);

                  try {
                    // If existing recipe, restore to original in database
                    await axiosInstance.put(`/api/recipes/${recipeId}/revert`, {
                      userId: user.id,
                      recipeName: originalRecipeRef.current.recipeName,
                      direction: originalRecipeRef.current.direction,
                      servingSize: originalRecipeRef.current.servingSize,
                      state: 'saved',
                      recipeItems: originalRecipeRef.current.recipeItems,
                    });
                  } catch (error) {
                    console.error('Error restoring original recipe:', error);
                    Alert.alert('Error', 'Failed to restore original recipe');
                  }
                }
                navigation.navigate('Log Food', { user });
            },
            style: 'destructive'
          }
        ],
        { cancelable: true }
      );
  };

  // Function to convert values to desired display format
  const formatNumber = (value) => {
    // Display empty values as 0
    if (isNaN(value) || value === null || value === undefined) {
      value = 0;
    }

    // Round the number to one decimal place
    const roundedValue = Math.round(value * 10) / 10;
  
    // Check if the rounded value is an integer
    if (Number.isInteger(roundedValue)) {
      return roundedValue.toString(); // Return as whole number
    } else {
      return roundedValue.toFixed(1); // Return with one decimal place
    }
  };

  // Function to convert calorie value to desired display format
  const formatCal = (value) => {
    if (isNaN(value) || value === null || value === undefined || value === Infinity) {
      // Return empty values as 0
      return '0';
    } else {
      // Return value rounded to one decimal place
      return value.toFixed(); 
    }
  };
  
  // Function to set focus on text inputs
  const handleFocus = () => {
    setInputFocused(true);
  }

  // Function to unfocus text inputs
  const handleBlur = () => {
    setInputFocused(false);
  }

  // Function to collapse ingredients list when text inputs are focused
  useEffect(() => {
    if (inputFocused) {
      setShowIngredients(false);
    }
  }, [inputFocused]);

  // Function to expand ingredients list when text inputs aren't focused
  useEffect(() => {
    if (!inputFocused) {
      setShowIngredients(true);
    }
  }, [inputFocused]);

  // Function to toggle ingredients list
  const handleViewIngredients = () => {
    setShowIngredients(!showIngredients);
    Keyboard.dismiss();
  };

  // Function to delete ingredient by swiping right on list item
  const handleDeletePress = (foodItem, index) => {
    if (isDeleting) {
      return; // Exit function if deletion is already in process
    }
    setIsDeleting(true); // Update delete state to true
    
    // Close the delete swipeable
    const swipeable = swipeableRefs.current[index];
    if (swipeable) {
      swipeable.close();
    }
  
    // Make the delete request
    axiosInstance.delete(`/api/recipes/${recipeId}/items/${foodItem.recipeItemId}`)
      .then(() => {
        fetchRecipeDetails(); // Refresh the data and update totals
      })
      .catch(error => {
        console.error('Error deleting item:', error);
      })
      .finally(() => {
        setIsDeleting(false); // Reset delete state
      });
  };
      
  // Function to render swipeable delete button
  const renderRightActions = (progress, dragX, item, index) => {
    return (
      <TouchableOpacity
        style={styles.slideDeleteButton}
        onPress={() => handleDeletePress(item, index)}
      >
        <Text style={styles.slideDeleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const validServingSize = servingSize && !isNaN(servingSize) && servingSize > 0 ? servingSize : 1;

  // Function to render each food item in the ingredients list
  const renderFoodItem = ({ item, index }) => {
    return (
      <Swipeable
        ref={ref => (swipeableRefs.current[index] = ref)} // Assign the ref
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item, index)}
        onSwipeableWillOpen={() => {
          // Close any currently active swipeable
          if (activeSwipeableId !== null && activeSwipeableId !== index) {
            const activeSwipeable = swipeableRefs.current[activeSwipeableId];
            if (activeSwipeable) {
              activeSwipeable.close();
            }
          }
          // Set the new active ID
          setActiveSwipeableId(index);
        }}
        onSwipeableWillClose={() => {
          // Reset active ID when closing
          setActiveSwipeableId(null);
        }}
        ><View style={styles.item}>
          <Text style={styles.nameText}>{item.foodName}</Text>
          <Text style={styles.quantityText}>{item.unitQuantity} {item.unit}</Text>
        </View>
      </Swipeable>
    );
  }; 
  
  // Function to update serving size
  const onServingChange = (event, servingSize) => {
    if (servingSize) {
      setServingSize(servingSize);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <Text style={styles.heading}>Create Recipe</Text>

      <TextInput
        style={styles.input}
        placeholder="Recipe Name"
        value={recipeName}
        onChangeText={setRecipeName}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <TextInput
        style={styles.input}
        placeholder="Number of Servings"
        keyboardType="numeric"
        value={servingSize}
        onChangeText={setServingSize}
        returnKeyType='done'
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {!inputFocused ? (
        <TouchableOpacity style={styles.buttonAddView} onPress={handleAddItem}>
          <Text style={styles.buttonTextAdd}>＋ Add Ingredient</Text>
        </TouchableOpacity>
        ) : (
        <TouchableOpacity style={styles.buttonAddView} onPress={handleViewIngredients}>
          <Text style={styles.buttonTextAdd}>＋ Add or View Ingredients</Text>
        </TouchableOpacity>
      )}

      {!inputFocused && showIngredients ? (
        <View style={styles.itemContainer}>
        
        {foodItems.length !== 0 ? (
          <View style={styles.addLine}></View>
        ) : null}

        <FlatList
          data={foodItems}
          keyExtractor={(item) => item.id} // Use the unique ID from each item
          renderItem={renderFoodItem} // Use renderFoodItem function here
          contentContainerStyle={styles.listContainer}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
        />
        </View>
      ) :
      (<View style={styles.emptySpace}></View>)}

      <View style={styles.bottomContainer}>
        <TextInput
          style={styles.directions}
          placeholder="Directions (Optional)"
          value={direction}
          multiline={true}
          scrollEnabled={true}
          numberOfLines={4}
          returnKeyType='return'
          onChangeText={setDirection}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <View style={styles.nutritionalInfo}>
          <Text style={styles.totalText}>Totals Per Serving:</Text>
          <Text style={styles.foodLogText}>
            <Text style={styles.calColor}>Calories: </Text><Text>{formatCal(recipe.calories / validServingSize)}</Text>
            <Text style={styles.proColor}>   Protein: </Text><Text>{formatNumber(recipe.protein / validServingSize)}g</Text>
            <Text style={styles.carbColor}>   Carbs: </Text><Text>{formatNumber(recipe.carbs / validServingSize)}g</Text>
            <Text style={styles.fatColor}>   Fat: </Text><Text>{formatNumber(recipe.fat / validServingSize)}g</Text>
          </Text>
        </View>

        <View style={styles.extraSpace}></View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
            onPress={handleSaveRecipe} disabled={isLoading}>
            <Text style={styles.buttonText}>Save Food Item</Text>
          </TouchableOpacity>

          <View style={styles.emptySpace}></View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteRecipe}>
            <Text style={styles.deleteText}>Discard & Exit</Text>
          </TouchableOpacity>
          <View style={styles.bottomSafe}></View>
        </View>
      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, inputFocused, insets, width, height) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  heading: {
    fontSize: height * .0255,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    marginBottom: height * .0215,
    paddingTop: height * .011,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#8f8f8f',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .016, 
    padding: height * .00825,
    marginBottom: height * .0085,
    borderRadius: 4,
    marginHorizontal: height * .011,
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  totalText: {
    textAlign: 'center',
    fontSize: height * .0165,
    fontFamily: 'VarelaRound-Regular',
    color: 'gray',
    marginBottom: height * .0085,
  },
  foodLogText: {
    textAlign: 'center',
    fontSize: height * .016,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  calColor: {
    fontWeight: 'bold',
    color: '#8438f5',
  },
  proColor: {
    fontWeight: 'bold',
    color: '#eb23dd',
  },
  carbColor: {
    fontWeight: 'bold',
    color: '#00aaff',
  },
  fatColor: {
    fontWeight: 'bold',
    color: '#23eb41',
  },
  directions: {
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#8f8f8f',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .016, 
    padding: height * .0085,
    borderRadius: 4,
    marginHorizontal: height * .011,
    height: height * .135,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  itemContainer: {
    flex: 1.
  },
  item: {
    padding: 10,
    padding: height * .011,
    borderBottomWidth: 1,
    borderBottomColor: colorScheme === 'dark' ? 'white' : '#424242',
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#ebe8e8',
  },
  flatList: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  nameText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .017,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  quantityText: {
    textAlign: 'center',
    fontFamily: 'VarelaRound-Regular',
    fontSize:  height * .015,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: colorScheme === 'dark' ? 'white' : '#424242',
    paddingTop: 20,
    marginTop: 11,
    bottom: 10,
  },
  nutritionalInfo: {
    marginTop: 16,
  },
  buttonContainer: {
    paddingHorizontal: 10,
  },
  addLine: {
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorScheme === 'dark' ? 'white' : '#424242',
  },
  buttonAddView: {
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#7323eb',
    padding: height * .011,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonTextAdd: {
      fontFamily: 'Quicksand-Bold',
      color: '#8438f5',
      fontSize: 16,
      fontSize: height * .017,
  },
  buttonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#fff',
    fontSize: 16,
    fontSize: height * .017,
  },
  slideDeleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colorScheme === 'dark' ? 'white' : 'black',
    width: '20%', 
    height: '100%',
  },
  slideDeleteText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .017,
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: height * .005,
    marginBottom: height * .018,
    alignSelf: 'center',
  },
  deleteText: {
    color: '#fe0000',
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
  },
  emptySpace: {
    height: 10,
    height: height * .011,
  },
  extraSpace: {
    height: height * .02,
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
});

export default AddNewRecipeScreen;