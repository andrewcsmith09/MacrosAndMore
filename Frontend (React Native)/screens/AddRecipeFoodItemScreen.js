import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, useColorScheme, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axiosInstance from '../../Config/axios_config';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * AddRecipeFoodItemScreen
 *
 * Allows users to search for food items to add as ingredients to a recipe.
 * Users can toggle between custom food items and USDA food database results.
 * It supports dynamic searching, filtering, and adding new custom food items if a match isn’t found.
 * Upon selecting a food item, users are navigated to a detailed food entry screen for inclusion in the recipe.
 * This screen is accessible during both recipe creation and editing flows.
 */

const AddRecipeFoodItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { user, recipe } = route.params;
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCustomFoods, setShowCustomFoods] = useState(false);

  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window'); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, insets, width, height);

  // Function to fetch results based on search query
  const fetchData = async () => {
    try {
      let url = '';
      let filteredResults = [];

      if (query.trim() === '' || query === null) {
        // When the search bar is empty, fetch first 20 results based on the selection
        if (showCustomFoods) {
          // Display custom foods when tab is selected
          url = `/api/food/first20/user/${user.id}`; 
        } else {
          setSearchResults([]); // Clear results if neither is selected
          return;
        }
      } else {
        // Send the request with the provided query or user ID
        url = showCustomFoods 
            ? `/api/food/user/${user.id}`
            : `/api/food/search?name=${encodeURIComponent(query)}`;
      }

      // Fetch results from the determined URL
      const mySQLResults = await axiosInstance.get(url);

      // Process MySQL results
      filteredResults = mySQLResults.data;

      // Additional search if neither food nor recipe is selected
      if (!showCustomFoods) {
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
          const itemName = item.name.toLowerCase();
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

  // Function to fetch data when query or selected tab is changed
  useEffect(() => {
    fetchData();
  }, [query, showCustomFoods]);  


  // Function to fetch and set data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData(); // Refresh data when screen is focused
      setQuery('');
      setShowCustomFoods(false);
    });

    return unsubscribe;
  }, [navigation]);


  // Function to navigate to 'Add New Food Item' screen
  const handleAddNewFoodItem = () => {
    navigation.navigate('Add New Food Item', { user: user, foodName: query });
  };

  // Function to load nutrition details when a food item is pressed
  const handleFoodItemPress = async (foodItem) => {
    try {
      if (foodItem.foodNutrients) {
        // Retrieve and separate nutrient values from food item
        let nutrients = foodItem.foodNutrients.reduce((acc, nutrient) => {
          acc[nutrient.nutrientNumber] = parseFloat(nutrient.value) / 100 || 0;
          return acc;
        }, {});
  
        // Assign nutrient values and create food item
        const newFoodItem = {
          name: foodItem.name,
          servingSize: foodItem.servingSize,
          servingSizeUnit: foodItem.servingSizeUnit,
          servingText: foodItem.servingText,
          calories: nutrients['208'] || 0,
          carbs: nutrients['205'] || 0,
          fat: nutrients['204'] || 0,
          protein: nutrients['203'] || 0,
          fiber: nutrients['291'] || 0,
          calcium: nutrients['301'] || 0,
          iron: nutrients['303'] || 0,
          sodium: nutrients['307'] || 0,
          vitaminA: nutrients['318'] || 0,
          vitaminC: nutrients['401'] || 0,
          vitaminD: nutrients['328'] || 0,
          cholesterol: nutrients['601'] || 0,
          transFat: nutrients['605'] || 0,
          saturatedFat: nutrients['606'] || 0,
          polyunsaturatedFat: nutrients['646'] || 0,
          monounsaturatedFat: nutrients['645'] || 0,
          potassium: nutrients['306'] || 0,
          totalSugars: nutrients['269'] || 0,
          addedSugars: nutrients['539'] || 0
        };
  
        // Send new food item to backend
        const response = await axiosInstance.post('/api/food/add', newFoodItem);
        const newId = response.data.id;

        // Navigate to Recipe Details screen
        navigation.navigate('Recipe Food Details', { foodItemId: newId, userId: user.id, user: user, recipe: recipe });

      } else {
        // If food item already saved in database, navigate directly to 'Recipe Food Details' screen
        navigation.navigate('Recipe Food Details', { foodItemId: foodItem.id, userId: user.id, user: user, recipe: recipe });
      }
    } catch (error) {
      console.error('Error adding new food item:', error);
      Alert.alert('Error', 'Failed to create new food item. Please try again later.');
    }
  };

  // Function to display custom saved foods
  const handleToggleMyFood = () => {
      if (!showCustomFoods) {
        setShowCustomFoods(true);
      } else {
        fetchData();
      }
      setSearchResults([]); // Clear results when switching
  };

  // Function to display all foods from database
  const handleToggleAllFood = () => {
    if (showCustomFoods) {
      setShowCustomFoods(false);
    } else {
      fetchData();
    }
    setSearchResults([]); // Clear results when switching
  };

  // Function to render button to create new food item
  const renderAddNewFoodItem = () => (
    <TouchableOpacity onPress={handleAddNewFoodItem} style={styles.item}>
      <Text style={styles.createFood}>Create New Food Item</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.topSafe}></View>

        <View style={styles.innerHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'< Back    '}</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Find Food</Text>
        </View>

        <View style={styles.innerContainer}>
          <View style={styles.emptySpace}></View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !showCustomFoods && styles.toggleButtonActive]}
              onPress={handleToggleAllFood}
            >
              <Text style={[styles.toggleButtonText, !showCustomFoods && styles.toggleButtonTextActive]}>All Food</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, showCustomFoods && styles.toggleButtonActive]}
              onPress={handleToggleMyFood}
            >
              <Text style={[styles.toggleButtonText, showCustomFoods && styles.toggleButtonTextActive]}>My Food</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Search food..."
            value={query}
            onChangeText={setQuery}
            returnKeyType='done'
          />
          <FlatList
            data={[{ key: 'addNewItem' }, ...searchResults]}
            showsVerticalScrollIndicator={false}
            style={styles.flatlist}
            keyExtractor={(item, index) => item.key ? item.key : index.toString()}
            renderItem={({ item }) =>
              item.key === 'addNewItem' ? renderAddNewFoodItem() : (
                <TouchableOpacity onPress={() => handleFoodItemPress(item)}>
                  <View style={styles.item}>
                    <Text style={styles.foodItemText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )
            }
          />
        </View>
      </View>
      <View style={styles.bottomSafe}></View>
    </View>
  );
};

const dynamicStyles = (colorScheme, insets, width, height) => StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  innerContainer: {
    paddingHorizontal: 10,
    flex: 1,
  },
  innerHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: height * .03215,
    backgroundColor: colorScheme === 'dark' ? '#141414' : '#f7f7f7',
    borderBottomColor: colorScheme === 'dark' ?  '#e0dede' : '#919090',
    borderBottomWidth: 2,
  },
  backButton: {
    top: height * .018,
    right: width * .39,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .018,
    color: '#8438f5',
  },
  heading: {
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .02575,
    top: height * -.01,
    marginBottom: height * -.028,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * .0105,
    paddingTop: height * .0105,
  },
  toggleButton: {
    padding: height * .0108,
    paddingHorizontal: height * .03,
    marginBottom: height * .005,
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
  button: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  selectedButton: {
    backgroundColor: '#ddd',
  },
  buttonText: {
    color: '#000',
  },
  selectedButtonText: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .017,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  flatlist: {
    flex: 1,
  },
  createFood: {
    color: '#8438f5',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .017,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  foodItemText: {
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .017,
  },
  emptySpace: {
    paddingBottom: 15,
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
});

export default AddRecipeFoodItemScreen;
