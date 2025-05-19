import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Dimensions} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * UserInfoScreen
 * 
 * Displays detailed user account information including account creation date, email, full name, and login streak. 
 * Shows a list of user achievements with counts and last achieved dates for various nutritional goals. 
 * Allows navigation to edit user information via an Edit Info button. 
 * Can be accessed through the settings menu.
 */

const UserInfoScreen = ({ route, navigation }) => {
    const { user } = route.params;
    const [userData, setUserData] = useState(user);
    const [plural, setPlural] = useState(user.loginStreak === 1 ? 'day' : 'days');

    const { width, height } = Dimensions.get('window'); 
    const insets = useSafeAreaInsets(); 
    const colorScheme = useColorScheme();
    const styles = dynamicStyles(colorScheme, insets, width, height);

    // Function to convert date to calendar format
    const formatDateToStandard = (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number);
      
      const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
      ];

      return `${monthNames[month - 1]} ${day}, ${year}`;
    };
    

    return (
        <View style={styles.container}>
            <View style={styles.topSafe}></View>
            
            <View style={styles.innerHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>{'< Back    '}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Account Info</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLeft}>Account Created:</Text> 
                        <Text style={styles.infoRight}>{userData ? formatDateToStandard(userData.accountCreated) : '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLeft}>Email:</Text> 
                        <Text style={styles.infoRight}>{userData ? userData.username : '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLeft}>Full Name:</Text> 
                        <Text style={styles.infoRight}>{userData ? `${userData.firstName} ${userData.lastName}` : '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLeft}>Login Streak:</Text> 
                        <Text style={styles.infoRight}>{userData ? `${userData.loginStreak} ${plural}` : '-'}</Text>
                    </View>
                    {userData ? 
                      <TouchableOpacity style={styles.buttonEditView} onPress={() => navigation.navigate('Edit Info', { user: userData })}>
                        <Text style={styles.buttonTextEdit}>Edit Info</Text>
                      </TouchableOpacity>
                    : null}
                </View>

                <View style={styles.lineContainer}>
                    <View style={styles.line}/>
                </View>

                <View style={styles.achievementContainer}>
                    <Text style={styles.achievementHeading}>My Achievements</Text>

                    <View style={styles.goalContainer}>
                      <View style={styles.roundContainer}>
                        <Text style={styles.achievementTitle}>Taking The First Step</Text>
                        <Text style={styles.achievementDesc}>Finish the day with your calorie goal met.</Text>
                        <Text style={styles.achievementTimes}>Number Of Times Achieved:</Text>
                        <Text style={styles.achievementNum}>{userData ? userData.metCalorieNum : null}</Text>
                        {userData.metCalorieGoal ?
                          <Text style={styles.lastAchieved}>Last Achieved: {userData ? formatDateToStandard(userData.metCalorieGoal) : null}</Text>
                        : null}
                      </View>
                    </View>

                    <View style={styles.goalContainer}>
                      <View style={styles.roundContainer}>
                        <Text style={styles.achievementTitle}>Harder Than It Sounds</Text>
                        <Text style={styles.achievementDesc}>Finish the day with your calorie and macros goals met.</Text>
                        <Text style={styles.achievementTimes}>Number Of Times Achieved:</Text>
                        <Text style={styles.achievementNum}>{userData ? userData.metCalMacNum : null}</Text>
                        {userData.metCalMacGoal ?
                          <Text style={styles.lastAchieved}>Last Achieved: {userData ? formatDateToStandard(userData.metCalMacGoal) : null}</Text>
                        : null}
                      </View>
                    </View>

                    <View style={styles.goalContainer}>
                      <View style={styles.roundContainer}>
                        <Text style={styles.achievementTitle}>Save Some For The Fishes</Text>
                        <Text style={styles.achievementDesc}>Finish the day by meeting or exceeding your water goal.</Text>
                        <Text style={styles.achievementTimes}>Number Of Times Achieved:</Text>
                        <Text style={styles.achievementNum}>{userData ? userData.metWaterNum : null}</Text>
                        {userData.metWaterGoal ?
                          <Text style={styles.lastAchieved}>Last Achieved: {userData ? formatDateToStandard(userData.metWaterGoal) : null}</Text>
                        : null}
                      </View>
                    </View>

                    <View style={styles.goalContainer}>
                      <View style={styles.roundContainer}>
                        <Text style={styles.achievementTitle}>It Keeps Me Regular</Text>
                        <Text style={styles.achievementDesc}>Finish the day with your fiber goal met.</Text>
                        <Text style={styles.achievementTimes}>Number Of Times Achieved:</Text>
                        <Text style={styles.achievementNum}>{userData ? userData.metFiberNum : null}</Text>
                        {userData.metFiberGoal ?
                          <Text style={styles.lastAchieved}>Last Achieved: {userData ? formatDateToStandard(userData.metFiberGoal) : null}</Text>
                        : null}
                      </View>
                    </View>

                    <View style={styles.goalContainer}>
                      <View style={styles.roundContainer}>
                        <Text style={styles.achievementTitle}>Macros & More</Text>
                        <Text style={styles.achievementDesc}>Finish the day with all nutritional goals met.</Text>
                        <Text style={styles.achievementTimes}>Number Of Times Achieved:</Text>
                        <Text style={styles.achievementNum}>{userData ? userData.metAllNum : null}</Text>
                        {userData.metAllGoals ?
                          <Text style={styles.lastAchieved}>Last Achieved: {userData ? formatDateToStandard(userData.metAllGoals) : null}</Text>
                        : null}
                    </View>
                  </View>
                </View>
               <View style={styles.emptySpace}></View> 
            </ScrollView>
            <View style={styles.bottomIconsContainer}>
              <TouchableOpacity
                style={styles.bottomIcon}
                onPress={() => navigation.navigate('Home', { username: userData.username })}
              >
                <Icon name="home" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomIcon}
                onPress={() => navigation.navigate('Log Food', { user: userData })}
              >
                <Icon name="add-circle-outline" size={width * .065} color='#5f91f5' />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomIcon}
                onPress={() => navigation.navigate('My Food Log', { userId: userData.id, user: userData })}
              >
                <Icon name="list" size={width * .065} color={colorScheme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>
          </View>
        </View>
    ); 
};

const dynamicStyles = (colorScheme, insets, width, height) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
  heading: {
    fontSize: height * .0275,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'center',
    top: height * .016,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  infoContainer: {
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLeft: {
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .018,
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'left',
    paddingTop: height * .02,
    paddingLeft: height * .015,
  },
  infoRight:{
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .018,
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'right',
    paddingTop: height * .02,
    paddingRight: height * .015,
  },
  buttonEditView: {
    alignItems: 'center',
    paddingTop: height * .015,
  },
  buttonTextEdit: {
      fontFamily: 'Quicksand-Bold',
      color: '#8438f5',
      fontSize: height * .0175,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * .016,
    marginBottom: height * -.035,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: 'slategray',
  },
  achievementHeading:{
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .025,
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'center',
    paddingTop: height * .04,
  },
  goalContainer: {
    paddingTop: height * .025,
    paddingBottom: height * .005,
    alignItems: 'center',
  },
  roundContainer: {
    backgroundColor: colorScheme === 'dark' ? '#424242' : '#d1cfcf',
    minWidth: width * .85,
    paddingVertical: height * .025,
    paddingBottom: height * .01,
    borderRadius: 10,
    elevation: 3,
    shadowColor: colorScheme === 'dark' ? '#0a0a0a' : '#2b2a2a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  achievementTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .02,
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'center',
  },
  achievementDesc: {
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .014,
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'center',
    paddingTop: height * .008,
  },
  achievementTimes: {
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .012,
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'center',
    paddingTop: height * .015,
  },
  achievementNum: {
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .04,
    color: '#8438f5',
    color: colorScheme === 'dark' ? '#8438f5' : '#7323eb',
    textAlign: 'center',
  },
  lastAchieved: {
    fontFamily: 'VarelaRound-Regular',
    fontSize: height * .014,
    color: colorScheme === 'dark' ? 'white' : 'black',
    textAlign: 'center',
    paddingTop: height * .005,
    paddingBottom: height * .01,
  },
  emptySpace: {
    paddingTop: height * .025,
  },
  bottomIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 2,
    borderColor: colorScheme === 'dark' ? 'lightgrey' : '#919090',
    paddingVertical: height * .015,
    paddingBottom: insets.bottom === 0 ? height * .015 : insets.bottom - height * .005,
    bottom: 0,
    backgroundColor: colorScheme === 'dark' ? 'black' : '#e0dede',
  },
  bottomIcon: {
    alignItems: 'center',
  },
});

export default UserInfoScreen;