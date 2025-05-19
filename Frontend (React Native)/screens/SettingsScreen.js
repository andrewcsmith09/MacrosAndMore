import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Linking, useColorScheme, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../../Config/axios_config';

/**
 * SettingsScreen
 * 
 * Provides a user interface for managing user settings including viewing and editing personal information, 
 * calculating and manually adjusting daily macronutrient goals, and accessing app information and contact options. 
 * Supports secure logout with token removal and account deletion with data wipe after user confirmation. 
 * Includes links to Terms & Conditions and Privacy Policy, and navigation controls to main app areas via bottom icons. 
 * Can be accessed by pressing the settings icon in the top right corner of each screen.
 */

const SettingsScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const { id } = user;

  const { width, height } = Dimensions.get('window'); 
  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, insets, width, height);

  // Function to logout user
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Log Out',
          onPress: async () => {
            try {
              // Delete access tokens
              await SecureStore.deleteItemAsync('accessToken');
              await SecureStore.deleteItemAsync('refreshToken');
              // Navigate to login screen
              navigation.navigate('Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Logout Failed', 'An error occurred. Please try again.');
            }
          },
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  // Function to delete user account
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account?',
      'Are you sure you want to delete your account? All data associated with this account will be erased, ' + 
      'including custom foods, recipes and food logs. Erased data cannot be recovered.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // Send delete request
              await axiosInstance.delete(`/api/users/${id}`);
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
              // Delete access tokens
              await SecureStore.deleteItemAsync('accessToken');
              await SecureStore.deleteItemAsync('refreshToken');
              // Navigate to login screen
              navigation.navigate('Login');
            } catch (error) {
              console.error('Deletion error:', error);
              Alert.alert('Deletion Failed', 'An error occurred. Please try again.');
            }
          },
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
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

  // Function to navigate to previous screen
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerHeader}>
        <TouchableOpacity style={styles.mealButton} onPress={handleBack}>
          <Text style={styles.backButton}>{'< Back    '}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.innerContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.firstButton} onPress={() => navigation.navigate('User Info', { user })}>
            <View style={styles.buttonView}>
              <Icon name="person" size={height * .0215} color="#8438f5" paddingTop={height * .0015}/>
              <Text style={styles.buttonText}> My Info</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.lineContainer}>
            <View style={styles.line}/>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Macros', { user })}>
            <View style={styles.buttonView}>
              <Icon name="calculator" size={height * .0215} color="#8438f5" paddingTop={height * .0015}/>
              <Text style={styles.buttonText}> Calculate Daily Goals</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.lineContainer}>
            <View style={styles.line}/>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Manually Adjust Daily Goals', { user })}>
          <View style={styles.buttonView}>
              <Icon name="pencil" size={height * .0215} color="#8438f5" paddingTop={height * .0015}/>
              <Text style={styles.buttonText}> Manually Adjust Daily Goals</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.lineContainer}>
            <View style={styles.line}/>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('About')}>
            <View style={styles.buttonView}>
              <Icon name="information-circle" size={height * .0215} color="#8438f5" paddingTop={height * .0015}/>
              <Text style={styles.buttonText}> About This App</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.lineContainer}>
            <View style={styles.line}/>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Contact', { user })}>
            <View style={styles.buttonView}>
              <Icon name="mail" size={height * .0215} color="#8438f5" paddingTop={height * .0015}/>
              <Text style={styles.buttonText}> Contact Us</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.lineContainer}>
            <View style={styles.line}/>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <View style={styles.buttonView}>
              <Icon name="log-out" size={height * .0215} color="#8438f5" paddingTop={height * .0015}/>
              <Text style={styles.buttonText}> Logout</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.lineContainer}>
            <View style={styles.line}/>
          </View>

          <TouchableOpacity style={styles.lastButton} onPress={handleDeleteAccount}>
            <View style={styles.buttonView}>
              <Icon name="trash" size={height * .0215} color="#fe0000" paddingTop={height * .0012}/>
              <Text style={styles.deleteText}> Delete Account</Text>
            </View>
          </TouchableOpacity>

        </View>
      </View>

      <Text style={styles.title1}>macros</Text>
      <Text style={styles.title2}>&</Text>
      <Text style={styles.title3}>more</Text>

      <View style={styles.bottomContainer}>
        <View style={styles.termsRow}>
          <TouchableOpacity style={styles.termsButton} onPress={handlePressTerms}>
            <Text style={styles.termsText}>Terms & Conditions</Text>
          </TouchableOpacity>

          <Text style={styles.text}>│</Text>

          <TouchableOpacity style={styles.termsButton} onPress={handlePressPrivacy}>
            <Text style={styles.termsText}>Our Privacy Policy</Text>
          </TouchableOpacity>
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
            onPress={() => navigation.navigate('Log Food', { user })}
          >
            <Icon name="add-circle-outline" size={width * .065} color='#5f91f5' />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomIcon}
            onPress={() => navigation.navigate('My Food Log', { userId: user.id, user })}
          >
            <Icon name="list" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, insets, width, height) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#faf7f7',
    width: '100%',
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  emptySpace: {
    marginBottom: 8,
  },
  innerHeader: {
    backgroundColor: colorScheme === 'dark' ? '#141414' : '#f7f7f7',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: height * .03215,
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
  text: {
    fontSize: 18,
    marginBottom: 16,
  },
  buttonView: {
    flexDirection: 'row',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: height * .03,
    marginBottom: height * .29,
  },
  buttonContainer: {
    paddingTop: height * .01,
    paddingBottom: height * .01,
    flex: 1,
    justifyContent: 'space-between',
    maxHeight: height * .7,

    backgroundColor: colorScheme === 'dark' ? '#27282b' : '#e0dede',
    borderRadius: 10,
    elevation: 3,
    shadowColor: colorScheme === 'dark' ? '#0a0a0a' : '#2b2a2a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,    
  },
  button: {
    alignSelf: 'center',
  },
  firstButton: {
    paddingTop: height * .01,
    alignSelf: 'center',
  },
  lastButton: {
    alignSelf: 'center',
    paddingBottom: height * .01,
  },
  buttonText: {
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .02,
    fontFamily: 'Quicksand-Bold',
  },
  deleteText: {
    color: '#fe0000',
    fontSize: height * .02,
    fontFamily: 'Quicksand-Bold',
  },
  lineContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    height: 1.5,
    flex: 1,
    borderRadius: 40,
    backgroundColor: colorScheme === 'dark' ? '#4d4c4c' : '#bdbdbd',
  },
  title1: {
    textAlign: 'center',
    bottom: height * .19,
    marginBottom: height * -.005,
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .05,
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
  },
  title2: {
    textAlign: 'center',
    bottom: height * .19,
    marginBottom: height * -.005,
    fontFamily: 'RoundedMplus1c-Bold',
    fontSize: height * .038,
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
  },
  title3: {
    textAlign: 'center',
    bottom: height * .19,
    marginTop: height * -.005,
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .05,
    color: colorScheme === 'dark' ? 'white' : '#8438f5',
  },
  termsRow: {
    flexDirection: 'row',
    bottom: height * .09,
    justifyContent: 'center',
    right: width * .013,
    marginTop: height * -.01,
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

export default SettingsScreen;
