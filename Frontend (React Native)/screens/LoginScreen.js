import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Linking, Alert, useColorScheme, 
 TouchableOpacity, StatusBar, Keyboard, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axiosInstance from '../../Config/axios_config';
import * as SecureStore from 'expo-secure-store';

/**
 * LoginScreen
 * 
 * Provides a user interface for logging in with email and password, including validation and error handling.
 * Supports toggling password visibility, keyboard management, and navigation to registration and password recovery screens.
 * Handles secure storage of authentication tokens and resend of email verification if needed.
 * Incorporates adaptive styling based on color scheme and safe area insets.
 */

const { width, height } = Dimensions.get('window'); 

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentInput, setCurrentInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [inputFocused, setInputFocused] = useState(false);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); 
  const styles = dynamicStyles(colorScheme, inputFocused, insets);

  // Function to set access token
  const setAccessToken = async (token) => {
    try {
      await SecureStore.setItemAsync('accessToken', token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  };

  // Function to set refresh token
  const setRefreshToken = async (token) => {
    try {
      await SecureStore.setItemAsync('refreshToken', token);
      const credentials = await SecureStore.getItemAsync('refreshToken');
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  };


  const handleLogin = async () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); // Disable the button by setting loading to true

    // Validate and verify email and password fields
    if (!validateEmail(username)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    } else if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Missing Info', 'Email and password fields must both be filled out.');
      setIsLoading(false);  
      return;
    }
  
    try {
      // Send post request for login
      const response = await axiosInstance.post('/api/users/login', {
        username,
        passwordHash: password, 
      });
  
      const { data } = response;
      if (data && data.accessToken) {
        // Save tokens to storage
        await setAccessToken(data.accessToken);
        await setRefreshToken(data.refreshToken); 

        // Navigate to home screen
        navigation.reset({ 
          index: 0,
          routes: [{ name: 'Home', params: { username: username } }],
        });
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
        setIsLoading(false);  
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data;

        // Display relevant error messages
        if (errorMessage === "Please verify your email before logging in.") {
          Alert.alert(
            'Email Not Verified',
            'Please click the verification link that was sent to your email before logging in for the first time.',
            [
              { text: 'Ok', style: 'cancel' },
              { text: 'Resend Email', onPress: () => handleResendVerification() },
            ]
          );
          setIsLoading(false);  
        } else {
          Alert.alert('Login Failed', errorMessage);
          setIsLoading(false); 
        }
      } else {
        Alert.alert('Login Failed', 'An error occurred. Please try again.');
        setIsLoading(false);  
      }
    }
  };  

  // Function to send new email verification link
  const handleResendVerification = async () => {
    try {
      const response = await axiosInstance.post('/api/resend-verification', { username });
      Alert.alert('Verification Email Sent', 'A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      console.error("Resend Verification Error:", error.response ? error.response.data : error);
      Alert.alert('Error', 'Could not send verification email. Please try again later.');
    }
  };

  // Function to validate email using standard email validation regex pattern
  const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  // Function to navigate to 'Register' screen
  const handleCreateAccountClick = () => {
    navigation.navigate('Register');
  }

  // Function to navigate to 'Forgot Password' screen
  const handleForgotPassword = () => {
    navigation.navigate("Forgot Password");
  }

  // Function to manually dismiss the keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss(); 
  };

  // Function to toggle the visibility of password
  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  // Function for custom password view filter, to avoid issues with IOS password manager
  const handlePasswordChange = (text) => {
    // Check if the new text length is greater than the current input
    if (text.length > currentInput.length) {
        // New character added
        const newChar = text.slice(-1);
        setPassword(prev => prev + newChar); // Append the new character to the password
    } else {
        setPassword(password.slice(0, -1)); // Remove the last character from password
    }
    setCurrentInput(text); // Update the current input
  };
    
  // Display plain text or security dots based on password visibilty
  const passwordDisplayValue = isPasswordVisible
    ? password
    : password.length > 0
        ? `${'●'.repeat(password.length - 1)}${currentInput.slice(-1)}` // Show last character only when typing
        : '';

  // Function to scroll up screen to focus text inputs
  const handleScrollUp = () => {
    Animated.timing(scrollY, {
        toValue: -height * 0.26, 
        duration: 300,
        useNativeDriver: true,
    }).start();
  };

  // Function to scroll down to unfocus text inputs
  const handleScrollDown = () => {
    Animated.timing(scrollY, {
        toValue: 0, 
        duration: 300,
        useNativeDriver: true,
    }).start();
  };

  // Function to open Terms & Conditions url
  const handlePressTerms = () => {
    const url = 'https://andrewsmithdevelopment.com/terms-and-conditions';
    Linking.openURL(url).catch(err => console.error('Failed to open URL', err));
  };

  // Function to open Privacy Policy url
  const handlePressPrivacy = () => {
    const url = 'https://andrewsmithdevelopment.com/privacy-policy';
    Linking.openURL(url).catch(err => console.error('Failed to open URL', err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerContainer}>
        <StatusBar backgroundColor={colorScheme === 'dark' ? 'white' : 'black'} />
        
        <Animated.ScrollView
          style={[styles.scrollView, { transform: [{ translateY: scrollY }] }]}
          keyboardShouldPersistTaps="handled" scrollEnabled={false}
        >

          <View style={styles.emptySpace2}></View>
          <Text style={styles.title1}>macros</Text>
          <Text style={styles.title2}>&</Text>
          <Text style={styles.title3}>more</Text>

          <Text style={styles.welcome}>Welcome to a healthier you.</Text>
          <Text style={styles.welcome2}>It all starts with signing in.</Text>

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={username}
            keyboardType='email-address'
            returnKeyType='done'
            onChangeText={setUsername}
            autoCompleteType="off"
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="none"
            onFocus={handleScrollUp}
            onBlur={handleScrollDown}
          />

          <Text style={styles.label}>Password:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={passwordDisplayValue}
              onChangeText={handlePasswordChange}
              returnKeyType='done'
              autoCompleteType="off"
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              onFocus={handleScrollUp}
              onBlur={handleScrollDown}
            />
            <TouchableOpacity style={styles.buttonShowView} onPress={togglePasswordVisibility} >
              <Text style={styles.buttonShowText}>{isPasswordVisible ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.forgot}>
            <TouchableOpacity style={styles.buttonForgotView} onPress={() => {handleForgotPassword(); handleKeyboardDismiss();}}>
              <Text style={styles.buttonTextForgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptySpace}></View>
          <View>
            <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]}  
            onPress={() => {handleLogin(); handleKeyboardDismiss();}} disabled={isLoading}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        
            <View style={styles.lineContainer}>
              <View style={styles.line} />
              <View style={styles.textWrapper}>
                <Text style={styles.newText}>New User?</Text>
              </View>
              <View style={styles.line} />
            </View>

          <View>
            <TouchableOpacity style={styles.button} onPress={() => {handleCreateAccountClick(); handleKeyboardDismiss();}}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

        </Animated.ScrollView>

        <View style={styles.termsRow}>
          <TouchableOpacity style={styles.termsButton} onPress={handlePressTerms}>
              <Text style={styles.termsText}>Terms & Conditions</Text>
          </TouchableOpacity>

          <Text style={styles.text}>│</Text>

          <TouchableOpacity style={styles.termsButton} onPress={handlePressPrivacy}>
              <Text style={styles.termsText}>Our Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>  
      <Text style={styles.footer}>&copy; 2024 Andrew Smith</Text>
    </View>
  );
};

const dynamicStyles = (colorScheme, inputFocused, insets) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
  innerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scrollView: {
    paddingTop: height * .0537,
  },
  title1: {
    textAlign: 'center',
    bottom: height * .16,
    marginBottom: height * -.005,
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .05,
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
  },
  title2: {
    textAlign: 'center',
    bottom: height * .16,
    marginBottom: height * -.005,
    fontFamily: 'RoundedMplus1c-Bold',
    fontSize: height * .038,
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
  },
  title3: {
    textAlign: 'center',
    bottom: height * .16,
    marginTop: height * -.005,
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .05,
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
  },
  welcome: {
    textAlign: 'center',
    bottom: height * .061,
    marginBottom: height * .011,
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .0258,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  welcome2: {
    textAlign: 'center',
    bottom: height * .062,
    marginBottom: height * .009,
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .0195,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  label: {
    fontSize: height * .019,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    marginBottom: height * .013,
  },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    height: height * .043,
    paddingRight: 60,
    paddingHorizontal: 10,
    marginBottom: height * .025,
    borderRadius: 4,
    marginTop: height * -.01,
    fontSize: height * .0165,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  buttonShowView: {
    paddingTop: 13,
    position: 'absolute', // Position it inside the input
    right: 10, // Fixed position from the right edge of the input
    transform: [{ translateY: -12 }], // Adjust based on button size
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShowText: {
      fontFamily: 'Quicksand-Bold',
      color: '#8438f5',
      fontSize: height * .016,
  },
  emptySpace: {
    margin: height * .0215,
  },
  emptySpace2: {
    margin: height * .0858,
  },
  buttonForgotView: {
    marginTop: height * .004,
    alignItems: 'flex-end',
  },
  buttonTextForgot: {
    fontFamily: 'Quicksand-Bold',
    color: '#8438f5',
    fontSize: height * .0175,
  },
  buttonContainer: {
    paddingHorizontal: 90,
  },
  button: {
    backgroundColor: '#7323eb',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: height * .021,
  },
  buttonText: {
      color: '#fff',
      fontSize: height * .017,
      fontFamily: 'Quicksand-Bold',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * .016,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#a3a3a3',
    marginVertical: height * .0215,
  },
  textWrapper: {
    paddingHorizontal: 10,
  },
  newText: {
    fontSize: height * .015,
    fontFamily: 'VarelaRound-Regular',
    color: '#a3a3a3', // Color of the text
  },
  forgot: {
    alignItems: 'flex-end',
    marginTop: height * -.021,
  },
  termsRow: {
    flexDirection: 'row',
    bottom: height * -.01,
    justifyContent: 'center',
    right: width * .013,
  },
  text: {
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .012,
  }, 
  termsText: {
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .014,
  },
  footer: {
    position: 'absolute',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .012,
    bottom: insets.bottom === 0 ? height * .01 : height *  .021,
    alignSelf: 'center',
    right: width * .05,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
});

export default LoginScreen;
