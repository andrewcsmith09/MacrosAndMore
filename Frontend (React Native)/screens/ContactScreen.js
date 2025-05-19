import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, 
 TouchableWithoutFeedback, useColorScheme, Dimensions, Alert, Animated, Keyboard } from 'react-native';
import axiosInstance from '../../Config/axios_config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ContactScreen
 *
 * Allows users to send a message to the support team or provide feedback. 
 * It includes input fields for the user's name, email, subject, and message.
 * After the message is successfully sent, a confirmation alert is shown, and the user is navigated back to the previous screen.
 * In case of errors, the user is notified, and the loading state is managed to prevent multiple submissions.
 * This screen is accessible from the settings menu.
 */

const ContactScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [name, setName] = useState(`${user.firstName} ${user.lastName}`);
  const [email, setEmail] = useState(user.username);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window'); 
  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, insets, width, height);

  // Function to submit user created message
  const handleSubmit = async () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true);

    // Ensure fields aren't empty
    if (subject.trim() === '' || message.trim() === '') {
      Alert.alert('Empty Fields', 'Please fill out the subject and message fields before sending.');
      setIsLoading(false);  
      return;
    }
    
    // Prepare post data
    const contactData = {
      name,
      email,
      subject,
      message,
    };
    
    try { 
      // Send message post request, notify user, then navigate to previous screen
      axiosInstance.post('/api/users/contact-us', contactData);
      Alert.alert('Thank you for the feedback!', 'We will get back to you with any questions as soon as possible.');
      navigation.goBack();
    } catch (error) {
      // Notify user if unsuccessful
      console.error('Error Sending Contact Message:', error);
      setIsLoading(false);  
      Alert.alert('Error', 'Failed to send message. Please try again later.');
    }
  };

  // Function to navigate to previous screen
  const handleBack = () => {
    navigation.goBack();
  };

  // Function to scroll up screen and focus on message field
  const handleScrollUp = () => {
    Animated.timing(scrollY, {
      toValue: height * -0.08,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Function to scroll down screen and unfocus message field
  const handleScrollDown = () => {
    Animated.timing(scrollY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.topSafe}></View>
        
        <View style={styles.innerHeader}>
          <TouchableOpacity style={styles.mealButton} onPress={handleBack}>
            <Text style={styles.backButton}>{'< Back    '}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Contact Us</Text>
        </View>

        <View style={styles.innerContainer}>
          <Text style={styles.headerText}>Questions, comments, concerns? Feel free contact us for any reason 
          using the form below and we will get back to you using the email associated with your account. You
          can also contact us outside of the app by sending a message to support@andrewsmithdevelopment.com. 
          </Text>
          <Text style={styles.headerText2}>Thank you for using Macros&More!</Text>

          <Animated.ScrollView
              style={[styles.scrollView, { transform: [{ translateY: scrollY }] }]}
              keyboardShouldPersistTaps="handled" scrollEnabled={false}
          >

            <Text style={styles.text}>From: <Text style={styles.textEmail}>{user.username}</Text></Text>
              <TextInput
                  placeholder="Subject"
                  value={subject}
                  onChangeText={setSubject}
                  maxLength={50}
                  returnKeyType='done'
                  onFocus={handleScrollUp}
                  onBlur={handleScrollDown}
                  style={styles.input}
              />
              <TextInput
                  placeholder="Message"
                  value={message}
                  onChangeText={setMessage}
                  multiline={true}
                  scrollEnabled={true}
                  numberOfLines={4}
                  maxLength={2000}
                  returnKeyType='return'
                  onFocus={handleScrollUp}
                  onBlur={handleScrollDown}
                  style={styles.message}
              />
              
              <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]}  
              onPress={handleSubmit} disabled={isLoading}>
                  <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>

          </Animated.ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: height * .03,
  },
  headerText: {
    fontSize: height * .015,
    fontFamily: 'VarelaRound-Regular',
    textAlign: 'center',
    paddingBottom: height * .015,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  headerText2: {
    fontSize: height * .015,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    paddingBottom: height * .1,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  text: {
    fontSize: height * .016,
    fontFamily: 'Quicksand-Bold',
    paddingBottom: height * .026,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  textEmail: {
    fontSize: height * .016,
    fontFamily: 'VarelaRound-Regular',
    paddingBottom: height * .026,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  input: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    height: height * .043,
    padding: 8,
    paddingHorizontal: 10,
    marginBottom: height * .025,
    borderRadius: 4,
    marginTop: height * -.01,
    fontSize: height * .0165,
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  message: {
    borderWidth: colorScheme === 'dark' ? .5 : 1,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .0165, 
    padding: height * .0085,
    borderRadius: 4,
    height: height * .135,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  button: {
    backgroundColor: '#7323eb',
    padding:  height * .011,
    marginTop: height * .025,
    marginBottom: height * .05,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#fff',
    fontSize: height * .0175,
  },
  deleteText: {
    color: '#fe0000',
    fontSize: height * .02,
    fontFamily: 'Quicksand-Bold',
  },
});
    
export default ContactScreen;