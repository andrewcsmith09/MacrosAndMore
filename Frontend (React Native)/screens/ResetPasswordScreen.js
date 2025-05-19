import React, { useState, useRef } from 'react';
import { View, TextInput, Alert, StyleSheet, useColorScheme, Dimensions, 
  TouchableOpacity, Text, Keyboard } from 'react-native';
import axiosInstance from '../../Config/axios_config'; 
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ResetPasswordScreen
 *
 * Allows users to reset their password using a 6-digit code.
 * Validates the reset code, new password strength, and confirmation.
 * Can be accessed by entering user email in the Forgot Password screen.
 * If successful, updates the password via the backend API and navigates to Login.
 */

const ResetPasswordScreen = () => {
  const navigation = useNavigation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [code, setCode] = useState(Array(6).fill(''));

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  const inputsRef = useRef([]);

  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, width, height, insets);

  // Function to handle changes in the secure code text inputs
  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    // Update the input with a new digit
    newCode[index] = text.replace(/[^0-9]/g, ''); // Allow only numbers
    setCode(newCode);
    
    // Move to the next input if filled
    if (text.length === 1 && index < 5) {
        inputsRef.current[index + 1].focus();
    }
  };

  // Function to properly handle backspace in the secure code text inputs
  const handleKeyPress = (e, index) => {
    // Detect backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        // Clear the previous input and focus on it
        const newCode = [...code];
        newCode[index - 1] = ''; // Clear the previous input
        setCode(newCode);
        inputsRef.current[index - 1].focus(); // Move focus to the previous input
      }
    }
  };

  // Function to reset user password
  const handlePasswordReset = async () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); 

    // Ensure all fields are filled out
    const completeCode = code.join('');
    if (completeCode.trim() === '' || newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      Alert.alert('Empty Fields', 'All fields must be filled out.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }

    // Ensure both passwords match
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Passwords Do Not Match', 'Please enter your new password twice for confirmation.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }

    // Ensure secure code is in correct format
    if (isNaN(completeCode) || completeCode.length !== 6) {
      Alert.alert('Invalid Code', 'Incorrect format for reset code.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }

    // Validate new password
    const passwordValidationResult = validatePassword(newPassword);
    if (passwordValidationResult !== true) {
      Alert.alert('Invalid Password', passwordValidationResult);
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }

    try {
      // Send request to reset password
      const response = await axiosInstance.post('/api/reset-password', {
        code: completeCode,
        newPassword,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Password has been reset successfully.");
        navigation.navigate("Login");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          Alert.alert("Invalid Code", "Incorrect code was entered. Please check the code and try again.");
          setIsLoading(false);  // Re-enable the button if validation fails
        } else {
          Alert.alert("Error", error.response.data?.message || "An error occurred. Please try again.");
          setIsLoading(false);  // Re-enable the button if validation fails
        }
      } else {
        Alert.alert("Error", error.message || "An unexpected error occurred. Please try again.");
        setIsLoading(false);  // Re-enable the button if validation fails
      }
    }
  };

  // Function to cancel changes and navigate to login screen
  const handleCancel = () => {
    Alert.alert(
        'Leave Screen?',
        'Are you sure want to leave screen? This will cancel password reset.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Leave',
            onPress: () => {
              navigation.navigate('Login');
            },
            style: 'destructive'
          }
        ],
      { cancelable: true }
    );
  }

  // Function to toggle visibility of password
  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  // Function for custom password view filter, to avoid issues with IOS password manager
  const handlePasswordChange = (text) => {
    // Check if the new text length is greater than the current input
    if (text.length > currentInput.length) {
      const newChar = text.slice(-1);
      setNewPassword(prev => prev + newChar); // Append the new character to the password
    } else {
      setNewPassword(newPassword.slice(0, -1)); // Remove the last character from password
    }
    setCurrentInput(text); // Update the current input
  };
      
  // Display plain text or security dots based on password visibility
  const passwordDisplayValue = isPasswordVisible
    ? newPassword
    : newPassword.length > 0
      ? `${'●'.repeat(newPassword.length - 1)}${currentInput.slice(-1)}` // Show last character only when typing
      : '';

  // Function to toggle the visibility of the confirmation password
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(prev => !prev);
  };

  // Function for custom view filter for confirmation password
  const handleConfirmPasswordChange = (text) => {
    // Check if the new text length is greater than the current input
    if (text.length > confirmInput.length) {
      const newChar = text.slice(-1);
      setConfirmNewPassword(prev => prev + newChar); // Append the new character to the password
    } else {
      setConfirmNewPassword(confirmNewPassword.slice(0, -1)); // Remove the last character from password
    }
    setConfirmInput(text); // Update the current input
  };

  // Display plain text or security dots based on confirmation password visibility
  const confirmDisplayValue = isConfirmPasswordVisible
    ? confirmNewPassword
    : confirmNewPassword.length > 0
      ? `${'●'.repeat(confirmNewPassword.length - 1)}${confirmInput.slice(-1)}` // Show last character only when typing
      : '';

  // Function to validate password based on standard criteria
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

    return true; // Password is valid
  };

  // Function to manually dismiss keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss(); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerHeader}>
        <TouchableOpacity onPress={() => handleCancel()}>
          <Text style={styles.backButton}>{'< Back    '}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
      </View>
      <View style={styles.innerContainer}>
        <View style={styles.emptySpace}></View>
        <Text style={styles.label}>Enter Reset Code:</Text>
        <View style={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={text => handleCodeChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              style={styles.codeInput}
              keyboardType="numeric"
              returnKeyType='done'
              maxLength={1}
              ref={el => inputsRef.current[index] = el}
            />
          ))}
        </View>
        <Text style={styles.label}>New Password:</Text>
        <TextInput
          value={passwordDisplayValue}
          onChangeText={handlePasswordChange}
          returnKeyType='done'
          autoCompleteType="off"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          maxLength={40}
          style={styles.input}
        />
        <TouchableOpacity style={styles.buttonShowView} onPress={togglePasswordVisibility} >
            <Text style={styles.buttonShowText}>{isPasswordVisible ? "Hide" : "Show"}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Confirm New Password:</Text>
        <TextInput
          value={confirmDisplayValue}
          onChangeText={handleConfirmPasswordChange}
          returnKeyType='done'
          autoCompleteType="off"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          maxLength={40}
          style={styles.input}
        />
        <TouchableOpacity style={styles.buttonShowView2} onPress={toggleConfirmPasswordVisibility}>
          <Text style={styles.buttonShowText}>{isConfirmPasswordVisible ? "Hide" : "Show"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
         onPress={() => { handlePasswordReset(); handleKeyboardDismiss(); }}
         disabled={isLoading}
        >
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, width, height, insets) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
  title: {
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .02575,
    top: height * -.01,
    marginBottom: height * -.028,
  },
  innerContainer: {
    paddingHorizontal: 15,
  },
  label: {
    fontSize: height * .0185,
    marginBottom: height * .006,
    marginLeft: 2,
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'Quicksand-Bold',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: height * .005,
    paddingBottom: height * .03,
  },
  codeInput: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    textAlign: 'center',
    height: height * .063,
    width: width * .1, 
    marginHorizontal: 5,
    borderRadius: 4,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .021,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    height: height * .043,
    paddingHorizontal: 10,
    paddingRight: 60,
    marginBottom: height * .02,
    borderRadius: 4,
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .0165,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  buttonShowView: {
    paddingTop: 18,
    top: height * .19,
    position: 'absolute', 
    right: 25, 
    transform: [{ translateY: -12 }], 
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShowView2: {
    paddingTop: 18,
    top: 265,
    top: height * .282,
    position: 'absolute', 
    right: 25, 
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
    marginTop: height * .03,
    marginBottom: height * .021,
  },
  buttonText: {
    color: '#fff',
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
  },
  emptySpace: {
    padding: height * .015,
  },
});

export default ResetPasswordScreen;
