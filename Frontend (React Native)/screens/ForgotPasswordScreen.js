import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, useColorScheme, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../../Config/axios_config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ForgotPasswordScreen
 * 
 * This screen allows users to request a password reset by entering the email 
 * associated with their account. If the email is valid and registered, a reset 
 * code is sent to the user's email address. The screen includes input validation, 
 * error handling, and navigation to the reset password screen upon successful request.
 */

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const { width, height } = Dimensions.get('window');
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); 
  const styles = dynamicStyles(colorScheme, width, height, insets);

  // Function to handle password reset request
  const handlePasswordResetRequest = async () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true);

    // Verify and validate entered email
    if (!email) {
      Alert.alert("Enter email", "You must enter a valid email address.");
      setIsLoading(false); 
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      setIsLoading(false); 
      return;
    }

    try {
      // Send password reset request
      const response = await axiosInstance.post('/api/forgot-password', {
        email, 
      });
      // Alert user of successful request
      if (response.status === 200) {
        Alert.alert("Success", "Check your email for reset code.");
        navigation.navigate("Reset Password");
      }
    } catch (error) {
      if (error.response) {
        // Monitor for error code, display alert to user accordingly
        if (error.response.status === 404) {
          Alert.alert("No Account Found", "No account found for this email. Please check the email address or register a new account.");
          setIsLoading(false); 
        } else {
          Alert.alert("Error", error.response.data?.message || "An error occurred. Please try again.");
          setIsLoading(false);  
        }
      } else {
        Alert.alert("Error", error.message || "An unexpected error occurred. Please try again.");
        setIsLoading(false);  
      }
    }
  };   
  
  // Function to validate email using standard regex pattern
  const validateEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };
  
  // Function to manaully dismiss keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss(); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'< Back    '}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
      </View>
      <View style={styles.innerContainer}>
        <Text style={styles.headerText}>Forgot your password? Enter the email associated with
            your account below and we will send you a secure code that you can use to reset it.
        </Text>
        <Text style={styles.label}>Email:</Text>
        <TextInput
            style={styles.input}
            placeholder="jdoe@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            returnKeyType='done'
        />

        <View style={styles.emptySpace}></View>

        <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
          onPress={() => {handlePasswordResetRequest(); handleKeyboardDismiss();}}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Send Password Reset Code</Text>
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
  headerText: {
    fontSize: height * .015,
    fontFamily: 'Quicksand-Bold',
    marginTop: height * .04,
    paddingBottom: height * .01,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  label: {
    fontSize: height * .0185,
    marginTop: height * .04,
    marginBottom: height * .013,
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'Quicksand-Bold',
  },
  input: {
  borderWidth: colorScheme === 'dark' ? .5 : 1,
  borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
  height: height * .043,
  paddingHorizontal: 10,
  marginBottom: height * .05,
  borderRadius: 4,
  marginTop: height * -.01,
  fontSize: height * .0165,
  fontFamily: 'VarelaRound-Regular',
  color: colorScheme === 'dark' ? 'white' : 'black',
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
});

export default ForgotPasswordScreen;
