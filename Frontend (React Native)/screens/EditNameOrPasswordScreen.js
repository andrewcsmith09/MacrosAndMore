import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, useColorScheme, 
 Dimensions, Animated, StatusBar, Keyboard, Alert } from 'react-native';
import axiosInstance from '../../Config/axios_config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * EditNameOrPasswordScreen
 *
 * Allows users to update their personal information, either by changing their name or updating their password.
 * Includes input validation, secure password handling, and visual feedback for loading and errors.
 * It is accessed from the account settings section of the app and ensures secure and user-friendly profile updates.
 */

const EditNameOrPasswordScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [userData, setUserData] = useState('');
  const [firstName, setFirstName] = useState(user ? user.firstName : '');
  const [lastName, setLastName] = useState(user ? user.lastName : '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [oldInput, setOldInput] = useState('');
  const [newInput, setNewInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  
  const [isOldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { width, height } = Dimensions.get('window'); 
  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, insets, width, height, isEditingName, isEditingPassword);

  // Function to fetch user's data from database
  const fetchUserData = () => {
    if (user) {
      // Send get request to retrieve user's data
      axiosInstance.get(`/api/users/${user.id}`)
        .then(response => {
          setUserData(response.data); // Assign user data
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }
  };

  // Refresh user data when navigating to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });
    return unsubscribe;
  }, [navigation]);

  // Function to update user's name in database
  const handleUpdateName = () => {    
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true);

    // Ensure name fields are filled out
    if (firstName.trim() === '' || lastName.trim() === '') {
      Alert.alert('Missing Info', 'First name and last name must both be filled out.');
      setIsLoading(false);  
      return;
    }

    const updatedUser = {
      id: userData.id,
      firstName: firstName,
      lastName: lastName,
    };

    // Send request to update user information
    axiosInstance.put('/api/users/update', updatedUser)
      .then(response => {
        Alert.alert('Update Successful', 'Your information has been updated.');
        setIsEditingName(false); // Exit edit mode
        navigation.navigate('Home', {username: user.username} );
      })
      .catch(error => {
        console.error('Error updating information:', error);
        setIsLoading(false); // Re-enable button
        Alert.alert('Error', 'Failed to update information. Please try again later.');
      });     
  };

  // Function to update user's password
  const handleUpdatePassword = () => {
    if (isLoading) return;  
    setIsLoading(true);

    // Verify and validate passwords
    if (oldPassword.trim() === '' || newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      Alert.alert('Missing Info', 'All fields must be filled out.');
      setIsLoading(false);  
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("New Passwords Don't Match", 'Please enter the new password twice for confirmation.');
      setIsLoading(false);  
      return;
    }
    if (newPassword === oldPassword) {
      Alert.alert('Must Be New Password', 'New password cannot match previous password.');
      setIsLoading(false);  
      return;
    }
    const passwordValidationResult = validatePassword(newPassword);
    if (passwordValidationResult !== true) {
      Alert.alert('Invalid Password', passwordValidationResult);
      setIsLoading(false);  
      return;
    }

    // Prepare post data
    const params = {
      userId: userData.id,
      currentPassword: oldPassword,
      newPassword: newPassword,
    }
    
    // Send request to update user password
    axiosInstance.post('/api/users/update-password', null, { 
      params: {
        userId: userData.id,
        currentPassword: oldPassword,
        newPassword: newPassword,
      } 
    })
      .then(response => {
        if (response.data === "INCORRECT_CURRENT_PASSWORD") {
          Alert.alert('Error Updating Password', 'Incorrect current password entered.');
          setIsLoading(false);  
          return;
        } else {
          Alert.alert('Update Successful', 'Your password has been changed.');
          setIsEditingPassword(false);
          navigation.navigate('Home', {username: user.username});
        }
      })
      .catch(error => {
        setIsLoading(false);  
        console.error('Error verifying password: ', error);
      });     
  };

  // Function to validate a new password using standard criteria 
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

  // Function to navigate to previous screen
  const handleLeave = () => {
    navigation.goBack();
  };

  // Function to reset all forms to default state
  const handleCancel = () => {  
    setIsEditingName(false);
    setIsEditingPassword(false);

    setFirstName(userData.firstName);
    setLastName(userData.lastName);

    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  }

  // Function to toggle edit name mode
  const handleEditName = () => {
    setIsEditingName(true);
    setIsEditingPassword(false);
  }; 

  // Function to toggle edit password mode
  const handleEditPassword = () => {
    setIsEditingPassword(true);
    setIsEditingName(false);
  }; 

  // Function to manually dismiss keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };   

  // Function to toggle visibilty of old password
  const toggleOldPasswordVisibility = () => {
    setOldPasswordVisible(prev => !prev);
  };

  // Function for password view filter, to avoid issues with IOS password manager
  const handleOldPasswordChange = (text) => {
  // Check if the new text length is greater than the current input
  if (text.length > oldInput.length) {
    // New character added
    const newChar = text.slice(-1);
    setOldPassword(prev => prev + newChar); // Append the new character to the password
  } else {
    setOldPassword(oldPassword.slice(0, -1)); // Remove the last character from password
  }
  setOldInput(text); // Update the current input
  };
  // Display either password text or security dots based on visibility
  const oldPasswordDisplayValue = isOldPasswordVisible
    ? oldPassword
    : oldPassword.length > 0
      ? `${'●'.repeat(oldPassword.length - 1)}${oldInput.slice(-1)}` // Show last character only when typing
      : '';

  // Function to toggle visibility of new password
  const toggleNewPasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  // Function for password view filter for new password
  const handleNewPasswordChange = (text) => {
  if (text.length > newInput.length) {
    const newChar = text.slice(-1);
    setNewPassword(prev => prev + newChar); 
  } else {
    setNewPassword(newPassword.slice(0, -1)); 
  }
  setNewInput(text); 
  };
      
  const newPasswordDisplayValue = isNewPasswordVisible
    ? newPassword
    : newPassword.length > 0
      ? `${'●'.repeat(newPassword.length - 1)}${newInput.slice(-1)}` 
      : '';

  // Function to toggle visibility of confirmation password
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(prev => !prev);
  };

  // Function for custom password view filter for confirmation password
  const handleConfirmPasswordChange = (text) => {
    if (text.length > confirmInput.length) {
      const newChar = text.slice(-1);
      setConfirmNewPassword(prev => prev + newChar); 
    } else {
      setConfirmNewPassword(confirmNewPassword.slice(0, -1));
    }
    setConfirmInput(text); 
    };

  const confirmDisplayValue = isConfirmPasswordVisible
    ? confirmNewPassword
    : confirmNewPassword.length > 0
      ? `${'●'.repeat(confirmNewPassword.length - 1)}${confirmInput.slice(-1)}` 
      : '';

  // Function to scroll up screen to focus edit name section
  const handleNameScrollUp = () => {
    Animated.timing(scrollY, {
      toValue: height * 0.1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setNameFocused(true);
  };

  // Function to scroll down screen to unfocus name section
  const handleNameScrollDown = () => {
    Animated.timing(scrollY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setNameFocused(false);
  };

  // Function to scroll up screen to focus edit password section
  const handlePasswordScrollUp = () => {
    Animated.timing(scrollY, {
      toValue: height * 0.03,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setPasswordFocused(true);
  };

  // Function to scroll down screen to unfocus edit password section
  const handlePasswordScrollDown = () => {
    Animated.timing(scrollY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setPasswordFocused(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colorScheme === 'dark' ? 'white' : 'black'} />
      <View style={styles.topSafe}></View>
      
      <View style={styles.innerContainer}>
        <View style={styles.innerHeader}>
          <TouchableOpacity onPress={() => handleLeave()}>
            <Text style={styles.backButton}>{'< Back    '}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Info</Text>
        </View>

        <Animated.ScrollView
          style={[styles.scrollView, { transform: [{ translateY: scrollY }] }]}
          keyboardShouldPersistTaps="handled" scrollEnabled={false}
        >
          <View style={styles.empty}></View>

          {!passwordFocused ?
            <View style={styles.roundContainer}>
              <Text style={styles.label}>First name:</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType='done'
                maxLength={30}
                onFocus={handleNameScrollUp}
                onBlur={handleNameScrollDown}
                editable={isEditingName ? true : false}
              />
              <Text style={styles.label}>Last name:</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType='done'
                maxLength={30}
                onFocus={handleNameScrollUp}
                onBlur={handleNameScrollDown}
                editable={isEditingName ? true : false}
              />
              {!isEditingName ? (
                <TouchableOpacity style={styles.buttonEditView} onPress={handleEditName}>
                  <Text style={styles.buttonTextEdit}>Edit Name</Text>
                </TouchableOpacity>
              ) : null}

              {isEditingName ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
                    onPress={() => { handleUpdateName(); handleKeyboardDismiss(); }}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Update Info</Text>
                  </TouchableOpacity>
                  <View style={styles.cancelSpace}>
                    <TouchableOpacity style={styles.buttonForgotView} onPress={() => { handleCancel(); handleKeyboardDismiss(); }}>
                      <Text style={styles.buttonTextCancel}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          : null }

          {!nameFocused ?
            <View style={styles.roundContainer}>
              <Text style={styles.label}>Current Password:</Text>
              <TextInput
                style={styles.input2}
                value={oldPasswordDisplayValue}
                onChangeText={handleOldPasswordChange}
                returnKeyType='done'
                autoCompleteType="off"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                placeholder='●●●●●●●●'
                maxLength={40}
                onFocus={handlePasswordScrollUp}
                onBlur={handlePasswordScrollDown}
                editable={isEditingPassword ? true : false}
              />
              {isEditingPassword ?
                <TouchableOpacity style={styles.buttonShowView} onPress={toggleOldPasswordVisibility} >
                  <Text style={styles.buttonShowText}>{isOldPasswordVisible ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
                : null 
              }
              
              {isEditingPassword ?
                (<Text style={styles.criteria}>Must be at least 8 characters, 
                  contain at least one uppercase and lowercase letter, contain at least
                  one number or special character.
                </Text>)
                : (<View style={styles.empty2}></View>)
              }
                  
              <Text style={styles.label}>New Password:</Text>
              <TextInput
                style={styles.input2}
                value={newPasswordDisplayValue}
                onChangeText={handleNewPasswordChange}
                returnKeyType='done'
                autoCompleteType="off"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                placeholder='●●●●●●●●'
                maxLength={40}
                onFocus={handlePasswordScrollUp}
                onBlur={handlePasswordScrollDown}
                editable={isEditingPassword ? true : false}
              />
              {isEditingPassword ?
                <TouchableOpacity style={styles.buttonShowView2} onPress={toggleNewPasswordVisibility} >
                  <Text style={styles.buttonShowText}>{isNewPasswordVisible ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
                : null 
              }

              <Text style={styles.label}>Confirm New Password:</Text>
              <TextInput
                style={styles.input2}
                value={confirmDisplayValue}
                onChangeText={handleConfirmPasswordChange}
                returnKeyType='done'
                autoCompleteType="off"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                placeholder='●●●●●●●●'
                maxLength={40}
                onFocus={handlePasswordScrollUp}
                onBlur={handlePasswordScrollDown}
                editable={isEditingPassword ? true : false}
              />
              {isEditingPassword ?
                <TouchableOpacity style={styles.buttonShowView3} onPress={toggleConfirmPasswordVisibility}>
                  <Text style={styles.buttonShowText}>{isConfirmPasswordVisible ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
                : null 
              }

              {!isEditingPassword ?
                <TouchableOpacity style={styles.buttonEditView} onPress={handleEditPassword}>
                  <Text style={styles.buttonTextEdit}>Change Password</Text>
                </TouchableOpacity>
              : null}

              {isEditingPassword ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
                    onPress={() => { handleUpdatePassword(); handleKeyboardDismiss(); }}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Update Password</Text>
                  </TouchableOpacity>
                  <View style={styles.cancelSpace}>
                    <TouchableOpacity style={styles.buttonForgotView} onPress={() => { handleCancel(); handleKeyboardDismiss(); }}>
                      <Text style={styles.buttonTextCancel}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          : null }
        </Animated.ScrollView>
      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, insets, width, height, isEditingName, isEditingPassword) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
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
    flex: 1,
  },
  empty: {
    marginTop: height * .03,
  },
  empty2: {
    margin: height * .008,
  },
  label: {
    fontSize: height * .019,
    marginHorizontal: height * .02,
    marginBottom: height * .005,
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'Quicksand-Bold',
  },
  roundContainer: {
    backgroundColor: colorScheme === 'dark' ? '#424242' : '#d1cfcf',
    minWidth: width * .85,
    marginBottom: height * .04,
    marginHorizontal: height * .02,
    paddingVertical: height * .025,
    paddingBottom: height * .013,
    borderRadius: 10,
    elevation: 3,
    shadowColor: colorScheme === 'dark' ? '#0a0a0a' : '#2b2a2a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: isEditingName ? 'black' : colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .0165,
    height: height * .043,
    paddingHorizontal: 10,
    marginHorizontal: height * .02,
    marginBottom: height * .016,
    borderRadius: 4,
    marginTop: height * -.003,
    color: isEditingName ? 'black' : colorScheme === 'dark' ? 'white' : 'black',
    backgroundColor: isEditingName ? '#e8e3e3' : colorScheme === 'dark' ? '#424242' : '#d1cfcf',
  },
  input2: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: isEditingPassword ? 'black' : colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .0165,
    height: height * .043,
    paddingRight: 60,
    paddingHorizontal: 10,
    marginHorizontal: height * .02,
    marginBottom: height * .016,
    borderRadius: 4,
    marginTop: height * -.003,
    color: isEditingPassword ? 'black' : colorScheme === 'dark' ? 'white' : 'black',
    backgroundColor: isEditingPassword ? '#e8e3e3' : colorScheme === 'dark' ? '#424242' : '#d1cfcf',
  },
  buttonShowView: {
    position: 'absolute', 
    right: 25,
    right: width * .06,
    top: height * .075,
    bottom: height * .036,
    marginBottom: -10,
    transform: [{ translateY: -12 }], 
    alignSelf: 'flex-end',
  },
  buttonShowView2: {
    position: 'absolute', 
    right: 25,
    right: width * .06,
    top: height * .194,
    bottom: height * .036,
    marginBottom: -10,
    transform: [{ translateY: -12 }], 
    alignSelf: 'flex-end',

  },
  buttonShowView3: {
    position: 'absolute', 
    right: 25, 
    right: width * .06,
    top: height * .279,
    bottom: height * .036,
    marginBottom: -10,
    transform: [{ translateY: -12 }], 
    alignSelf: 'flex-end',
  },
  buttonShowText: {
    fontFamily: 'Quicksand-Bold',
    color: '#8438f5',
    fontSize: height * .016,
  },
  criteria: {
    color: colorScheme === 'dark' ? '#ccc' : '#706f6f',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .012,
    paddingHorizontal: 20,
    paddingBottom: height * .005,
  },
  buttonEditView: {
    alignItems: 'flex-end',
  },
  buttonTextEdit: {
    fontFamily: 'Quicksand-Bold',
    color: '#8438f5',
    fontSize: height * .0175,
    marginHorizontal: height * .02,
  },
  button: {
    backgroundColor: '#7323eb',
    padding: 10,
    borderRadius: 5,
    marginTop: height * .01,
    marginHorizontal: height * .02,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .0175,
  },
  cancelSpace: {
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  buttonTextCancel: {
    fontFamily: 'Quicksand-Bold',
    color: 'red',
    fontSize: height * .0175,
  },
  errorMessage: {
    color: 'red',
    fontSize: height * .018,
    marginBottom: height * .013,
    textAlign: 'center',
  },
});

export default EditNameOrPasswordScreen;
