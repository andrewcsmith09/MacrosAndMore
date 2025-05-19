import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

/**
 * AboutScreen 
 * 
 * This screen displays detailed information about the Macros&More app,
 * including its purpose, features, privacy policy, a personal message from the developer,
 * and third-party data sources. It can be accessed in the settings menu.
 */

const AboutScreen = ({ navigation }) => {
  const { width, height } = Dimensions.get('window'); 
  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const styles = dynamicStyles(colorScheme, insets, width, height);

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

        <Text style={styles.title}>macros<Text style={styles.title2}>&</Text><Text style={styles.title}>more</Text></Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <Text style={styles.greeting}>Start your journey to a healthier you with Macros&More!</Text>

          <Text style={styles.text}>
            Macros&More is an all-in-one nutrition tracking app created with the sole purpose of improving
            your health. Designed to make tracking your nutrition easy, accurate, and enjoyable, Macros&More
            offers a wide variety of features to help you effortlessly manage your nutritional needs. This app
            automatically calculates your personalized nutritional goals using information like height, weight,
            age, pregnancy status and gender. You can also adjust these goals to suit your specific needs (we recommend
            consulting a physician to determine your ideal daily intake). {'\n'}{'\n'}
            Create and save custom foods and recipes, which can be added to your daily food log at any time.
            And it's not just about food—Macros&More also lets you track your daily water intake, because
            proper hydration is just as important as proper nutrition. Meet your goals regularly to unlock
            achievements, which you can view in the 'My Info' tab in the settings menu. {'\n'}{'\n'}
            We care about your privacy, so the only personally identifiable information we store is your name 
            and email address, just in case you ever need to recover your account. Rest assured, your data is
            securely managed 
            and stored on a trusted, industry-standard platform, ensuring privacy and reliability.{'\n'}{'\n'}
          </Text>

          <Text style={styles.text2}>
            We're grateful that you're here. Thank you for taking the first step towards a healthier you!
          </Text>

          <Text style={styles.devTitle}>Letter from the developer:</Text>
          <Text style={styles.text}>
            After graduating college with a degree in computer science, I was eager to start working on a new 
            project to add to my portfolio. I was considering several ideas, but I still wasn't sure what I
            should do—until my wife suggested I create a nutrition tracking app.{'\n'}{'\n'}
            It seemed like a good idea. Not only would it allow me to showcase my skills, but it could also give
            me the opportunity to make a meaningful contribution to people's health. So, I began planning what I 
            originally thought would be a relatively simple project.{'\n'}{'\n'}
            Fast forward several months, and what started as a simple idea has evolved into something much
            bigger. The process has been a challenging yet incredibly rewarding learning experience. From
            hours spent researching nutritional information, to experimenting with new features and fixing
            bugs, every step has taught me something valuable that I'll carry with me for years to come.{'\n'}{'\n'}
            With all that said, I can say that I am genuinely proud of the final product. If this app can 
            help just one person improve their health or make their life a little easier, then the long hours 
            of work have been more than worth it.{'\n'}{'\n'}
            I'd like to extend my heartfelt thanks to everyone who has chosen to download Macros&More. Your 
            support means more to me than words can express.{'\n'}{'\n'}
            Thank you for joining the Macros&More family!{'\n'}{'\n'}
            Andrew Smith{'\n'}
            Developer of Macros&More
          </Text>
          
          <Text style={styles.devTitle}>Third party providers:</Text>
          <Text style={styles.text}>Public food items are retrieved from USDA's FoodData Central database: {'\n'}{'\n'}
            U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2019. fdc.nal.usda.gov.
          </Text>

          <Text style={styles.footer}>&copy; 2024 Andrew Smith</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomSafe}></View>
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
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : '#7323eb',
    fontSize: height * .035,
    top: height * -.015,
    marginBottom: height * -.038,
  },
  title2: {
    textAlign: 'center',
    fontFamily: 'RoundedMplus1c-Bold',
    color: colorScheme === 'dark' ? 'white' : '#7323eb',
    fontSize: height * .0255,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 18,
    marginTop: height * .02,
  },
  greeting: {
    textAlign: 'center',
    marginBottom: height * .02,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .018,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  text: {
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  text2: {
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .0158,
    marginTop: height * -.02,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  devTitle: {
    marginTop: height * .07,
    marginBottom: height * .01,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .017,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  emptySpace: {
    paddingTop: height * .08,
  },
  footer: {
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .014,
    textAlign: 'right',
    paddingTop: height * .03,
    paddingBottom: height * .01,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
});

export default AboutScreen;