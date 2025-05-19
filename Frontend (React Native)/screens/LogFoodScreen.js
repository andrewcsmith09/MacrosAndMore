import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
 Alert, Dimensions, useColorScheme, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../Config/axios_config';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * LogFoodScreen
 * 
 * Allows the user to search for, view, and select food items or recipes to log their intake.
 * Supports searching across custom user foods, custom recipes, and the USDA food database.
 * Handles displaying search results, toggling between different data sources,
 * and navigation to detailed screens for food items, recipes, adding new food items,
 * adding water intake, and creating new recipes.
 */

const { width, height } = Dimensions.get('window'); 

const LogFoodScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { user } = route.params;
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [showCustomFoods, setShowCustomFoods] = useState(false);
  const [showCustomRecipes, setShowCustomRecipes] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, insets, width, height);

  // Function to retrieve selected date or today's date when screen is loaded
  useEffect(() => {
    const fetchSelectedDate = async () => {
      try {
        // Retrieve date from local storage
        const storedDate = await AsyncStorage.getItem('selectedDate');
        // Set selected date to stored date or today's date
        if (storedDate) {
          setSelectedDate(new Date(storedDate)); 
        } else {
          setSelectedDate(new Date());
        }
      } catch (error) {
        console.error('Error retrieving selectedDate from AsyncStorage:', error);
      }
    };
    const unsubscribe = navigation.addListener('focus', fetchSelectedDate);
    return unsubscribe;
  }, [navigation]); 

  // Function to fetch results based on search query
  const fetchData = async () => {
    try {
      let url = '';
      let filteredResults = [];

      if (query.trim() === '' || query === null) {
        // When the search bar is empty, fetch first 20 results based on the selection
        if (showCustomRecipes) {
          url = `/api/recipes/first20/user/${user.id}`; 
        } else if (showCustomFoods) {
          url = `/api/food/first20/user/${user.id}`; 
        } else {
          setSearchResults([]); // Clear results if neither is selected
          return;
        }
      } else {
        // When there's a query, set the URL for searching
        // Listen for the toggle between custom foods and recipes
        url = showCustomRecipes 
          ? `/api/recipes/search?recipeName=${encodeURIComponent(query)}&userId=${user.id}`
          : (showCustomFoods 
            ? `/api/food/user/${user.id}` 
            : `/api/food/search?name=${encodeURIComponent(query)}`);
      }

      // Fetch results from the determined URL
      const mySQLResults = await axiosInstance.get(url);

      // Process MySQL results
      filteredResults = mySQLResults.data;

      // USDA database search if neither custom food nor recipe is selected
      if (!showCustomRecipes && !showCustomFoods) {
        const fdcResponse = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
          params: {
            api_key: 'removed for github',
            query: query,
            pageSize: 50,
            fields: 'description,brandName,fdcId,foodNutrients'
          }
        });
        
        const fdcResults = fdcResponse.data.foods.map(food => ({
          id: food.fdcId,
          name: food.brandName ? `${food.description} (${food.brandName})` : food.description,
          servingSize: food.servingSize,
          servingSizeUnit: food.servingSizeUnit,
          servingText: food.householdServingFullText,
          foodNutrients: food.foodNutrients 
        }));
        
        // Combine results
        filteredResults = [
          ...filteredResults,
          ...fdcResults.filter(fdcItem => {
            return !filteredResults.some(mysqlItem => mysqlItem.name === fdcItem.name);
          })
        ];
      }

      // Apply filtering for the query if it exists
      if (query.trim() !== '') {
        const queryWords = query.trim().toLowerCase().split(/\s+/);
        filteredResults = filteredResults.filter(item => {
          const itemName = showCustomRecipes ? item.recipeName.toLowerCase() : item.name.toLowerCase();
          return queryWords.every(word => itemName.includes(word));
        });
      }

      // Set search results
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSearchResults([]); // Clear results on error
    }
  };

  // Function to fetch data anytime buttons are toggled or query is changed
  useEffect(() => {
    fetchData();
  }, [query, showCustomFoods, showCustomRecipes]);

  // Function to refetch data and reset screen to default when screen comes in focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData(); 
      setShowCustomFoods(false);
      setShowCustomRecipes(false);
      setQuery('');
    });

    return unsubscribe;
  }, [navigation]);
  
  // Function to toggle custom foods section when pressed if not already displayed
  const handleToggleMyFoods = () => {
    if (!showCustomFoods) {
      setShowCustomFoods(true);
      setShowCustomRecipes(false);
    } else {
      fetchData();
    }
    setSearchResults([]); // Clear results when switching
  };

  // Function to toggle recipes section when pressed if not already displayed
  const handleToggleRecipes = () => {
    if (!showCustomRecipes) {
      setShowCustomFoods(false);
      setShowCustomRecipes(true);
    } else {
      fetchData();
    }
    setSearchResults([]); 
  };

  // Function to toggle all foods section if neither custom foods nor recipes is selected
  const handleToggleAll = () => {
    if (showCustomFoods || showCustomRecipes) {
      setShowCustomFoods(false);
      setShowCustomRecipes(false);
    } else {
      fetchData();
    }
    setSearchResults([]); 
  };

  // Function to save food item and display details screen when pressed
  const handleFoodItemPress = (foodItem) => {
    if (foodItem.recipeName) {
      // Navigate to 'Recipe Details' screen if item is a recipe
      navigation.navigate('Recipe Details', { recipeId: foodItem.id, user: user, selectedDate: selectedDate.toISOString() });
    } else if (foodItem.foodNutrients) {
      let calories = 0, carbs = 0, fat = 0, protein = 0, fiber = 0, calcium = 0, iron = 0, sodium = 0, vitaminA = 0, vitaminC = 0, vitaminD = 0;
      let cholesterol = 0, transFat = 0, saturatedFat = 0, polyunsaturatedFat = 0, monounsaturatedFat = 0, potassium = 0, totalSugars = 0, addedSugars = 0;
  
      // Extract nutrient values and assign to variables
      foodItem.foodNutrients.forEach(nutrient => {
        switch(nutrient.nutrientNumber) {
          case '203': protein = nutrient.value; break;
          case '204': fat = nutrient.value; break;
          case '205': carbs = nutrient.value; break;
          case '208': calories = nutrient.value; break;
          case '269': totalSugars = nutrient.value; break;
          case '291': fiber = nutrient.value; break;
          case '301': calcium = nutrient.value; break;
          case '303': iron = nutrient.value; break;
          case '307': sodium = nutrient.value; break;
          case '320': vitaminA = nutrient.value; break;
          case '401': vitaminC = nutrient.value; break;
          case '601': cholesterol = nutrient.value; break;
          case '605': transFat = nutrient.value; break;
          case '606': saturatedFat = nutrient.value; break;
          case '646': polyunsaturatedFat = nutrient.value; break;
          case '645': monounsaturatedFat = nutrient.value; break;
          case '306': potassium = nutrient.value; break;
          case '539': addedSugars = nutrient.value; break;
          case '328': vitaminD = nutrient.value; break;
        }
      });
  
      // Create food item to add to user database
      const newFoodItem = {
        name: foodItem.name,
        servingSize: foodItem.servingSize,
        servingSizeUnit: foodItem.servingSizeUnit,
        servingText: foodItem.servingText,
        calories: (parseFloat(calories)/100) || 0,
        carbs: (parseFloat(carbs)/100) || 0,
        fat: (parseFloat(fat)/100) || 0,
        protein: (parseFloat(protein)/100) || 0,
        totalSugars: (parseFloat(totalSugars)/100) || 0,
        fiber: (parseFloat(fiber)/100) || 0,
        calcium: (parseFloat(calcium)/100) || 0,
        iron: (parseFloat(iron)/100) || 0, 
        sodium: (parseFloat(sodium)/100) || 0,
        vitaminA: (parseFloat(vitaminA)/100) || 0,
        vitaminC: (parseFloat(vitaminC)/100) || 0,
        cholesterol: (parseFloat(cholesterol)/100) || 0,
        transFat: (parseFloat(transFat)/100) || 0,
        saturatedFat: (parseFloat(saturatedFat)/100) || 0,
        polyunsaturatedFat: (parseFloat(polyunsaturatedFat)/100) || 0,
        monounsaturatedFat: (parseFloat(monounsaturatedFat)/100) || 0,
        potassium: (parseFloat(potassium)/100) || 0,
        addedSugars: (parseFloat(addedSugars)/100) || 0,
        vitaminD: (parseFloat(vitaminD)/100) || 0,
      };
  
      // Save food item to database
      axiosInstance.post('/api/food/add', newFoodItem)
        .then(response => {
          const newId = response.data.id;
          navigation.navigate('Food Details', { foodItemId: newId, userId: user.id, user: user, selectedDate: selectedDate.toISOString() });
        })
        .catch(error => {
          console.error('Error adding new food item:', error);
          Alert.alert('Error', 'Failed to create new food item. Please try again later.');
        });
    } else {
      // If food item is already in database, naviagate directly to 'Food Details' screen
      navigation.navigate('Food Details', { foodItemId: foodItem.id, userId: user.id, user: user, selectedDate: selectedDate.toISOString() });
    }
  };

  // Function to navigate to 'Add New Food Item' screen
  const handleAddNewFoodItem = () => {
    navigation.navigate('Add New Food Item', { user: user, foodName: query });
  };

  // Function to navigate to 'Add Water' screen
  const handleAddWater = () => {
    navigation.navigate('Add Water', { user, selectedDate: selectedDate.toISOString() });
  };

  // Function to navigate to 'New Recipe' screen
  const handleAddNewCustomRecipe = async () => {
    try {
      const response = await axiosInstance.post('/api/recipes', {
        name: 'Recipe in progress', 
        userId: user.id,
        state: 'new',
      });
      const newRecipeId = response.data.id;
      navigation.navigate('New Recipe Screen', { recipeId: newRecipeId, user: user });
    } catch (error) {
      console.error('Error creating recipe:', error);
      Alert.alert('Error', 'Failed to create new recipe. Please try again later.');
    }
  };

  // Function to determine the data in the results based on the conditions
  useEffect(() => {
    if (query.trim() === '' && !showCustomFoods && !showCustomRecipes) {
      setData(['no-results']); // Return an empty array to show nothing
    } else if (searchResults.length > 0) {
      setData(['no-results', ...searchResults]); // Show search results if they exist
    } else {
      setData(['no-results']); // Show "no-results" if there's no search result
    }
  }, [query, searchResults, showCustomFoods, showCustomRecipes]);


  // Function to display search function information
  const showAlert = async () => {
    // Check user preference
    const shouldShowAlert = await AsyncStorage.getItem('showAlert');

    if (shouldShowAlert === 'false') {
      return; // Don't show the alert if the user opted out
    }
  
    Alert.alert(
      "Food Search System",
      "Due to the way the USDA database functions, food results in the 'All Food' tab that haven't been logged before will only display " + 
      "after a whole word has been typed. Meaning, you must type at least one entire word in the " +
      "foods name before it will appear. This only applies to new foods, partial searches will always display " +
      "any previously logged foods. Custom foods and recipes will also display with a partial search.",
      [
        {
          text: "Don't show again",
          onPress: async () => {
            await AsyncStorage.setItem('showAlert', 'false'); // Save the user's preference
          },
        },
        {
          text: "OK",
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    showAlert(); 
  }, []);

  // Renders each search result in a list
  const renderFoodItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleFoodItemPress(item)}>
      {item.recipeName !== null ?
        <View style={styles.foodItemContainer}>
          <Text style={styles.foodItemText}>{item.recipeName || item.name}</Text>
        </View>
      : null}
    </TouchableOpacity>
  );

  // Renders 'Add Food Item', 'Add Recipe', and 'Add Water' buttons at the top of list 
  const renderNoResultsItem = () => (
   <>
    <TouchableOpacity onPress={showCustomRecipes ? handleAddNewCustomRecipe : handleAddNewFoodItem}>
      <View style={styles.foodItemContainer}>
        <Text style={styles.newFoodItemText}>{showCustomRecipes ? 'Create New Recipe' : 'Create New Food Item'}</Text>
      </View>
    </TouchableOpacity>
    {!showCustomRecipes && (
        <TouchableOpacity onPress={handleAddWater}>
          <View style={styles.foodItemContainer}>
            <Text style={styles.newWaterText}>Log Water</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );

  // Displays results list based on search query
  const renderItem = ({ item }) => {
    if (item === 'no-results') {
      return renderNoResultsItem();
    } else {
      return renderFoodItem({ item });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerHeader}>
        <Text style={styles.heading}>Food Menu</Text>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => navigation.navigate('Settings', { user: user })}
        >
          <Icon name="settings-outline" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        <View style={styles.toggleContainer}>
          
          <TouchableOpacity 
            style={[styles.toggleButton, !showCustomFoods && !showCustomRecipes && styles.toggleButtonActive]}
            onPress={() => {handleToggleAll(); Keyboard.dismiss();}}
          >
            <Text style={[styles.toggleButtonText, !showCustomFoods && !showCustomRecipes && styles.toggleButtonTextActive]}>All Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, showCustomFoods && !showCustomRecipes && styles.toggleButtonActive]}
            onPress={() => {handleToggleMyFoods(); Keyboard.dismiss();}}
          >
            <Text style={[styles.toggleButtonText, showCustomFoods && !showCustomRecipes && styles.toggleButtonTextActive]}>My Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, showCustomRecipes && styles.toggleButtonActive]}
            onPress={() => {handleToggleRecipes(); Keyboard.dismiss();}}
          >
            <Text style={[styles.toggleButtonText, showCustomRecipes && styles.toggleButtonTextActive]}>My Recipes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptySpace}></View>

        <TextInput
          style={styles.input}
          placeholder="Search food..."
          value={query}
          onChangeText={text => setQuery(text)}
          returnKeyType='done'
        />

        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id ? item.id.toString() : `${index}`}
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
        />
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
          onPress={() => navigation.navigate('Log Food', { user: user })}
        >
          <Icon name="add-circle-outline" size={width * .065} color='#5f91f5' />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIcon}
          onPress={() => navigation.navigate('My Food Log', { userId: user.id, user: user, date: selectedDate.toISOString() })}
        >
          <Icon name="list" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, insets, width, height) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
    paddingBottom: height * .063,
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  innerHeader: {
    paddingBottom: height * .03,
    borderTopColor: colorScheme === 'dark' ? 'white' : '#919090',
    borderBottomWidth: 2,
    borderBottomColor: colorScheme === 'dark' ? 'white' : '#919090',
    backgroundColor: colorScheme === 'dark' ? '#141414' : '#f7f7f7',
  },
  heading: {
    fontSize: height * .0275,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    top: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  settingsIcon: {
    position: 'absolute',
    top: height * .016,
    right: height * .0235,
    zIndex: 10,
  },
  innerContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: colorScheme === 'dark' ? '#141414' : '#f7f7f7',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * .0105,
    paddingTop: height * .0105,
  },
  toggleButton: {
    padding: height * .0108,
    backgroundColor: 'lightgray',
    borderRadius: 5,
    elevation: 3,
    shadowColor: colorScheme === 'dark' ? '#0a0a0a' : '#2b2a2a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    marginHorizontal: width * .015,
  },
  toggleButtonActive: {
    backgroundColor: 'gray',
  },
  toggleButtonText: {
    color: 'black',
    fontSize: height * .016,
    fontFamily: 'VarelaRound-Regular',
  },
  toggleButtonTextActive: {
    fontFamily: 'Quicksand-Bold',
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    padding: height * .0085,
    paddingHorizontal: height * .0105,
    marginBottom: height * .0105,
    borderRadius: 4,
    marginTop: height * -.0105,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .017,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  resultsContainer: {
    flex: 1,
  },
  foodItemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  foodItemText: {
    fontSize: height * .0175,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  newFoodItemText: {
    fontSize: height * .018,
    fontFamily: 'VarelaRound-Regular',
    color: '#8438f5',
  },
  newWaterText: {
    fontSize: height * .018,
    fontFamily: 'VarelaRound-Regular',
    color: '#19cdfa',
  },
  customMealsBox: {
    backgroundColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
  customMealsText: {
    color: 'white',
    fontFamily: 'VarelaRound-Regular',
    fontSize: 18,
    fontSize: height * .019,
    fontWeight: 'bold',
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
  emptySpace: {
    paddingTop: height * .0165,
  },
});

export default LogFoodScreen;

