import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axiosInstance from './Config/axios_config';
import * as SecureStore from 'expo-secure-store';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import LoginScreen from './Frontend (React Native)/screens/LoginScreen';
import HomeScreen from './Frontend (React Native)/screens/HomeScreen';
import RegisterScreen from './Frontend (React Native)/screens/RegisterScreen';
import SettingsScreen from './Frontend (React Native)/screens/SettingsScreen';
import MacroCalculatorScreen from './Frontend (React Native)/screens/MacroCalculatorScreen';
import LogFoodScreen from './Frontend (React Native)/screens/LogFoodScreen';
import FoodDetailsScreen from './Frontend (React Native)/screens/FoodDetailsScreen';
import AddNewFoodScreen from './Frontend (React Native)/screens/AddNewFoodScreen';
import UpdateFoodScreen from './Frontend (React Native)/screens/UpdateFoodScreen';
import MyFoodLogScreen from './Frontend (React Native)/screens/MyFoodLogScreen';
import LoggedFoodDetailsScreen from './Frontend (React Native)/screens/LoggedFoodDetailsScreen';
import LoggedRecipeDetailsScreen from './Frontend (React Native)/screens/LoggedRecipeDetailsScreen';
import MealDetailsScreen from './Frontend (React Native)/screens/MealDetailsScreen';
import DailyTotalDetailsScreen from './Frontend (React Native)/screens/DailyTotalDetailsScreen';
import AdjustGoalsScreen from './Frontend (React Native)/screens/AdjustGoalsScreen';
import AddNewRecipeScreen from './Frontend (React Native)/screens/AddNewRecipeScreen';
import AddRecipeFoodItemScreen from './Frontend (React Native)/screens/AddRecipeFoodItemScreen';
import RecipeFoodDetailsScreen from './Frontend (React Native)/screens/RecipeFoodDetailsScreen';
import RecipeDetailsScreen from './Frontend (React Native)/screens/RecipeDetailsScreen';
import AddWaterScreen from './Frontend (React Native)/screens/AddWaterScreen';
import ForgotPasswordScreen from './Frontend (React Native)/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './Frontend (React Native)/screens/ResetPasswordScreen';
import UserInfoScreen from './Frontend (React Native)/screens/UserInfoScreen'
import EditNameOrPasswordScreen from './Frontend (React Native)/screens/EditNameOrPasswordScreen';
import ContactScreen from './Frontend (React Native)/screens/ContactScreen';
import AboutScreen from './Frontend (React Native)/screens/AboutScreen';
import navigationService from './Config/navigationService';

/**
 * App
 * 
 * Main application entry point that initializes the app by loading custom fonts and validating authentication tokens.
 * Determines the initial screen based on token validity (Home if valid, Login otherwise).
 * Passes authenticated username as initial param to the Home screen.
 * Integrates a navigation service for handling navigation outside React components.
 * Manages screens for authentication, user settings, food logging, recipes, meals, macro calculation, hydration tracking, and informational pages.
 */

const Stack = createStackNavigator();

// Load custom fonts
const loadFonts = () => {
  return Font.loadAsync({
    'MPlus': require('./assets/fonts/MPLUSRounded1c-Bold.ttf'),
    'Varela': require('./assets/fonts/VarelaRound-Regular.ttf'),
    'Quicksand-Bold': require('./assets/fonts/Quicksand-Bold.ttf'),
  });
};

const customInterpolator = {
  cardStyleInterpolator: () => ({
    cardStyle: {
      transform: [{ translateX: 0 }], 
    },
  }),
};

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [username, setUsername] = useState(null);
 
  useEffect(() => {
    // Check token and load fonts
    const initialize = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await loadFonts();

        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
          const response = await axiosInstance.post('/api/auth/validate-token'); 
          const data = response.data;
          
          if (data.isValid) { 
            setUsername(data.username); 
            setInitialRoute('Home');
          } else {
            setInitialRoute('Login');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setInitialRoute('Login');
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  if (initialRoute === null) {
    return null; // Render a fallback UI while initialRoute is being determined
  }

  return (
    <NavigationContainer ref={(navigatorRef) => navigationService.setNavigator(navigatorRef)}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} /> 
        <Stack.Screen
          name="Home"
          initialParams={{ username }} // Pass initialParams to ensure username is available
          component={HomeScreen}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Macros" component={MacroCalculatorScreen} />
        <Stack.Screen name="Log Food" component={LogFoodScreen} />
        <Stack.Screen name="Food Details" component={FoodDetailsScreen} />
        <Stack.Screen name="Add New Food Item" component={AddNewFoodScreen} />
        <Stack.Screen name="Update Food Item" component={UpdateFoodScreen} />
        <Stack.Screen name="My Food Log" component={MyFoodLogScreen} />
        <Stack.Screen name="Logged Food Details" component={LoggedFoodDetailsScreen} />
        <Stack.Screen name="Logged Recipe Details" component={LoggedRecipeDetailsScreen} />
        <Stack.Screen name="Meal Details" component={MealDetailsScreen} />
        <Stack.Screen name="Daily Total Details" component={DailyTotalDetailsScreen} />
        <Stack.Screen name="Manually Adjust Daily Goals" component={AdjustGoalsScreen} />
        <Stack.Screen name="New Recipe Screen" component={AddNewRecipeScreen} />
        <Stack.Screen name="Add Recipe Item" component={AddRecipeFoodItemScreen} />
        <Stack.Screen name="Recipe Food Details" component={RecipeFoodDetailsScreen} />
        <Stack.Screen name="Recipe Details" component={RecipeDetailsScreen} />
        <Stack.Screen name="Add Water" component={AddWaterScreen} />
        <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
        <Stack.Screen name="Reset Password" component={ResetPasswordScreen} />
        <Stack.Screen name="User Info" component={UserInfoScreen} />
        <Stack.Screen name="Edit Info" component={EditNameOrPasswordScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
