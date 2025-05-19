import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, useColorScheme, TouchableOpacity,
 StatusBar, Dimensions, Keyboard, Animated, Linking } from 'react-native';
import axiosInstance from '../../Config/axios_config';

/**
 * RegisterScreen
 * 
 * Provides a user interface for creating a new account using email, name, and password.
 * Includes input validation for email format, password strength, and password confirmation.
 * Supports toggling password visibility with custom masked input handling to avoid autofill issues on iOS.
 * Prompts the user to agree to Terms & Conditions and Privacy Policy before proceeding with registration.
 * On successful registration, navigates to the login screen and alerts the user to verify their email.
 */

const { width, height } = Dimensions.get('window'); 

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [inputFocused, setInputFocused] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, inputFocused);

  // Function to register new user
  const handleRegister = async () => {
    try {
      // Send request to register user
      const response = await axiosInstance.post('/api/users/register', {
        username,
        firstName,
        lastName,
        passwordHash: password,
        accountCreated: getCurrentDate(),
        loginStreak: 1,
        metCalorieNum: 0,
        metCalMacNum: 0,
        metWaterNum: 0,
        metFiberNum: 0,
        metAllNum: 0,
      });
      const { data } = response;
      if (data === "User registered successfully.") {
        // Navigate to Login screen on successful registration
        Alert.alert('Please Verify Email', 'Please check your email and follow verification link before logging in for the first time.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration Error', 'There was an error registering your account. Please try again later.');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        Alert.alert('An account linked to this email already exists.', 'Please log in or use a different email.');
      } else {
        Alert.alert('Registration Error', 'An error occurred. Please try again.');
      }
    }
  };

  // Function to validate user information
  const handleConfirmSignUp = () => {
    // Ensure all info is provided
    if (!username || !firstName || !lastName || !password) {
      Alert.alert('Missing Info', 'All fields must be filled out.')
      return;
    }

    // Ensure provided email is valid
    if (!validateEmail(username)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Ensure password is valid
    const passwordValidationResult = validatePassword(password);
    if (passwordValidationResult !== true) {
      Alert.alert('Invalid Password', passwordValidationResult);
      return;
    }

    // Ensure both provided passwords match
    if (password !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please enter your password twice for confirmation.');
      return;
    }

    Alert.alert(
      'Confirm Agreement',
      'By proceeding, you agree to our Terms & Conditions and Privacy Policy. You can find links to ' + 
      'both forms at the bottom of this screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Agree',
          onPress: () => {
            // Proceed with user registration if they agree
            handleRegister();
          },
        },
      ]
    );
  };

  // Function to discard changes and navigate to previous screen
  const handleCancel = () => {
    Alert.alert(
        'Leave Screen',
        'Are you sure you want to leave screen? All progress will be lost.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Leave',
            onPress: () => {
              navigation.goBack();
            },
            style: 'destructive'
          }
        ],
      { cancelable: true }
    );
  }

  // Function to validate email format using regex pattern
  const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  // Function to validate password using standard criteria
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumberOrSpecial = /[0-9!@#$%^&*]/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long.';
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!hasNumberOrSpecial) {
        return 'Password must contain at least one number or special character.';
    }

    return true;
  };

  // Function to return current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  // Function for custom password view filter, to avoid issues with IOS password manager
  const handlePasswordChange = (text) => {
    // Check if the new text length is greater than the current input
    if (text.length > currentInput.length) {
      const newChar = text.slice(-1);
      setPassword(prev => prev + newChar); // Append the new character to the password
    } else {
      setPassword(password.slice(0, -1)); // Remove the last character from password
    }
    setCurrentInput(text); // Update the current input
  };
      
  // Display either plain text or security dots based on password visibilty
  const passwordDisplayValue = isPasswordVisible
    ? password
    : password.length > 0
      ? `${'●'.repeat(password.length - 1)}${currentInput.slice(-1)}` // Show last character only when typing
      : '';

  // Function to toggle visibilty of confirmation password
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(prev => !prev);
  };

  // Function for custom filter for confirmation password
  const handleConfirmPasswordChange = (text) => {
    // Check if the new text length is greater than the current input
    if (text.length > confirmInput.length) {
      const newChar = text.slice(-1);
      setConfirmPassword(prev => prev + newChar); // Append the new character to the password
    } else {
      setConfirmPassword(confirmPassword.slice(0, -1)); // Remove the last character from password
    }
    setConfirmInput(text); // Update the current input
  };

  // Display plain text or security dots based on visibility of confirmation password
  const confirmDisplayValue = isConfirmPasswordVisible
    ? confirmPassword
    : confirmPassword.length > 0
      ? `${'●'.repeat(confirmPassword.length - 1)}${confirmInput.slice(-1)}` // Show last character only when typing
      : '';

  // Function to manually dissmiss the keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };    

  // Function to scroll up screen to focus text inputs
  const handleScrollUp = () => {
    Animated.timing(scrollY, {
      toValue:  -height * 0.2,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Function to scroll down screen to unfocus text inputs
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
      <StatusBar backgroundColor={colorScheme === 'dark' ? 'white' : 'black'} /> 
      
      <Animated.ScrollView
          style={[styles.scrollView, { transform: [{ translateY: scrollY }] }]}
          keyboardShouldPersistTaps="handled" scrollEnabled={false}
      >
        <View style={styles.innerContainer}>
          <View style={styles.empty}></View>
          <Text style={styles.title}>macros<Text style={styles.title2}>&</Text><Text style={styles.title}>more</Text></Text>
          <Text style={styles.subtitle}>Take the first step towards a healthier you.</Text>

          <Text style={styles.label}>First name:</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="true"
            returnKeyType='done'
            autoCompleteType="off"
            autoCorrect={false}
            spellCheck={false}
            maxLength={40}
            onFocus={handleScrollUp}
            onBlur={handleScrollDown}
          />
          <Text style={styles.label}>Last name:</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="true"
            returnKeyType='done'
            autoCompleteType="off"
            autoCorrect={false}
            spellCheck={false}
            maxLength={40}
            onFocus={handleScrollUp}
            onBlur={handleScrollDown}
          />
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            returnKeyType='done'
            autoCompleteType="off"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            maxLength={80}
            onFocus={handleScrollUp}
            onBlur={handleScrollDown}
          />
          <Text style={styles.criteria}>Password must be at least 8 characters, 
            contain at least one uppercase and one lowercase letter, contain at least
            one number or special character.
          </Text>
          <Text style={styles.label}>Password:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={passwordDisplayValue}
              onChangeText={handlePasswordChange}
              returnKeyType='done'
              autoCompleteType="off"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              maxLength={40}
              onFocus={handleScrollUp}
              onBlur={handleScrollDown}
            />
            <TouchableOpacity style={styles.buttonShowView} onPress={togglePasswordVisibility} >
              <Text style={styles.buttonShowText}>{isPasswordVisible ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Confirm Password:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
                style={styles.passwordInput}
                value={confirmDisplayValue}
                onChangeText={handleConfirmPasswordChange}
                returnKeyType='done'
                autoCompleteType="off"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                maxLength={40}
                onFocus={handleScrollUp}
                onBlur={handleScrollDown}
            />
            <TouchableOpacity style={styles.buttonShowView} onPress={toggleConfirmPasswordVisibility}>
                <Text style={styles.buttonShowText}>{isConfirmPasswordVisible ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.empty2}></View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => {handleConfirmSignUp(); handleKeyboardDismiss();}}>
                    <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.cancelSpace}>
              <TouchableOpacity style={styles.buttonForgotView} onPress={() => {handleCancel(); handleKeyboardDismiss();}}>
                  <Text style={styles.buttonTextCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  );
};

const dynamicStyles = (colorScheme, inputFocused) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
    padding: 16,
  },
  empty: {
    margin: height * .027,
  },
  empty2: {
    margin: height * .012,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
    fontSize: height * .0385,
    marginBottom: height * .05,
  },
  title2: {
    textAlign: 'center',
    fontFamily: 'RoundedMplus1c-Bold',
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
    fontSize: height * .03,
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: 'VarelaRound-Regular',
    color: inputFocused ? colorScheme === 'dark' ? '#1c1b1b' : '#fff' : colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .02,
    marginBottom: height * .09,
  },
  label: {
    fontSize: height * .0185,
    marginBottom: height * .005,
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'Quicksand-Bold',
  },
  criteria: {
    color: colorScheme === 'dark' ? '#ccc' : '#706f6f',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .012,
    paddingBottom: height * .005,
  },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    height: height * .043,
    paddingHorizontal: 10,
    marginBottom: height * .015,
    borderRadius: 4,
    marginTop: height * -.003,
    fontSize: height * .0165,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  passwordInput: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    height: height * .043,
    paddingHorizontal: 10,
    paddingRight: 60,
    marginBottom: height * .015,
    borderRadius: 4,
    marginTop: height * -.003,
    fontSize: height * .0165,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  buttonShowView: {
    paddingTop: 18,
    position: 'absolute',
    right: 10,
    transform: [{ translateY: -12 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShowText: {
    fontFamily: 'Quicksand-Bold',
    color: '#8438f5',
    fontSize: height * .016,
  },
  button: {
    backgroundColor: '#7323eb',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .0175,
  },
  cancelSpace: {
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  buttonTextCancel: {
    fontFamily: 'Quicksand-Bold',
    color: 'red',
    fontSize: height * .0175,
  },
  termsRow: {
    flexDirection: 'row',
    bottom: height * .012,
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
});

export default RegisterScreen;
