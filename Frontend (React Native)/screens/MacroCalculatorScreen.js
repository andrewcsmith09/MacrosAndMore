import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableWithoutFeedback,
TouchableOpacity, Keyboard, useColorScheme, Animated, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axiosInstance from '../../Config/axios_config';

/**
 * MacroCalculatorScreen
 * 
 * This screen allows users to calculate their personalized daily nutritional goals 
 * (including calories, macros, water, and micronutrients) based on inputs such as 
 * weight, height, age, gender, activity level, and goals. It supports additional 
 * adjustments for pregnancy and breastfeeding. It is automatically loaded on a users 
 * first login and can also be visited at anytime from the settings menu. Results are 
 * calculated and sent to the backend to update the user's profile. No data is stored 
 * until the form is submitted.
 */

const { width, height } = Dimensions.get('window'); 

const MacroCalculatorScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const { id, username, firstName, lastName, accountCreated, metCalorieGoal, metCalMacGoal, 
  metWaterGoal, metFiberGoal, metAllGoals, metCalorieNum, metCalMacNum, metWaterNum, metFiberNum, metAllNum,
  dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } = user;
  const [weightLbs, setWeightLbs] = useState('');
  const [heightInches, setHeightInches] = useState(0);
  const [heightFeet, setHeightFeet]= useState(0);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('M');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [goal, setGoal] = useState('loseWeight');	
  const [trimester, setTrimester] = useState('firstTrimester');
  const [pregnancyStatus, setPregnancyStatus] = useState('');
  const [results, setResults] = useState(null);

  const [isPregnantOrBreastfeeding, setIsPregnantOrBreastfeeding] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); 
  const styles = dynamicStyles(colorScheme, insets, isSmall);

  // Function to display privacy information on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Alert.alert('Your Privacy Matters', 'None of the information on this screen is saved or stored. ' + 
        'It is only used to calculate your daily nutritional goals. The form will be reset immediately after ' +
        "you leave this screen. If you need to update your information, you can revisit this form at any time by pressing 'Calculate Daily Goals' " +
        'in the settings menu.');
    });

    return unsubscribe;
  }, [navigation, user, height]);

  // Function to control display format of screen based on screen dimensions
  useEffect(() => {
    const { height } = Dimensions.get('window');
    setIsSmall(height < 800);
  }, [height]);

  // Function to calculate and submit nutrition goals based on user provided information
  const calculateNutrients = () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); // Disable the button by setting loading to true

    const weight = parseFloat(weightLbs);
    const height = parseFloat(heightInches) + (parseFloat(heightFeet) * 12); 
    const ageNum = parseInt(age);

    // Verify necessary fields are filled out
    if (isNaN(weight) || isNaN(ageNum) || !heightFeet ) {
      Alert.alert('Invalid input', 'All fields must be filled out.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }
  
    // Ensure user is 13 or older
    if (ageNum < 13) {
      Alert.alert('Must be 13 or older', 'Users must be aged 13 or older.')
      setIsLoading(false); 
      return;
    }
  
    // Convert height and weight to metric
    const weightKg = weight * 0.453592;
    const heightCm = height * 2.54;
  
    // Pass values to other functions for calculation
    const bmr = calculateBMR(weightKg, heightCm, ageNum, gender);
    const tdee = calculateTDEE(bmr, getActivityLevelValue(activityLevel));
    let caloricIntakeGoal = calculateCaloricIntakeGoal(tdee, getGoalValue(goal));

    // Inner function to calculate suggested water intake goal
    const calculateWaterIntake = (tdee) => {
      if (pregnancyStatus === 'pregnant') {
        waterIntake = tdee;
      } else if (pregnancyStatus === 'breastfeeding') {
        waterIntake = tdee * 1.1039;
      } else {
        waterIntake = tdee * .8;
      }
      return waterIntake;
    };

    let waterIntake = calculateWaterIntake(tdee);
  
    // Adjust calories based on pregnancy status and trimester
    if (pregnancyStatus === 'pregnant') {
      switch (trimester) {
        case 'firstTrimester':
          break;
        case 'secondTrimester':
          caloricIntakeGoal += 340;
          break;
        case 'thirdTrimester':
          caloricIntakeGoal += 450;
          break;
        default:
          break;
      }
    } else if (pregnancyStatus === 'breastfeeding') {
      caloricIntakeGoal += 500;
    }
  
    // Pass values to getNutrientValues function
    const nutrientValues = getNutrientValues(gender, ageNum, pregnancyStatus, caloricIntakeGoal);
  
    const updatedResults = {
      ...nutrientValues,
      totalCalories: Math.round(caloricIntakeGoal),
      proteinGrams: Math.round((0.25 * caloricIntakeGoal) / 4),
      carbGrams: Math.round((0.45 * caloricIntakeGoal) / 4),
      fatGrams: Math.round((0.3 * caloricIntakeGoal) / 9),
    };
  
    setResults(updatedResults);
  
    // Create data for request
    const updateObject = {
      id, username, firstName, lastName, accountCreated,
      metCalorieGoal, metCalMacGoal, metWaterGoal, metFiberGoal, 
      metAllGoals, metCalorieNum, metCalMacNum, metWaterNum,
      metFiberNum, metAllNum,
      initialLogin: true,
      dailyCalorieGoal: Math.round(caloricIntakeGoal),
      dailyProteinGoal: updatedResults.proteinGrams,
      dailyCarbsGoal: updatedResults.carbGrams,
      dailyFatGoal: updatedResults.fatGrams,
      ...nutrientValues,
      water: waterIntake,
    };
  
    // Send request to update user's nutrient goals
    axiosInstance.put('/api/users/update', updateObject)
      .then(response => {
        if (pregnancyStatus === 'pregnant') {
          Alert.alert('Congratulations on your pregnancy!', "Be sure to go back and update your trimester information and weight " +
            "using 'Calculate Daily Goals' in the menu as your pregnancy progresses.");
        }
        navigation.navigate('Home', { username });
      })
      .catch(error => {
        console.error('Update failed:', error);
        Alert.alert('Error', "Sorry, we're not able to update your information right now. Please try again.")
        setIsLoading(false);  // Re-enable the button if validation fails
      });
  
    Keyboard.dismiss();
  };  

  // Function to calculate basal metabolic rate
  const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'M') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  // Function to calculate total daily energy expenditure
  const calculateTDEE = (bmr, activityLevelValue) => {
    switch (activityLevelValue) {
      case 1: return bmr * 1.2;
      case 2: return bmr * 1.375;
      case 3: return bmr * 1.55;
      case 4: return bmr * 1.725;
      case 5: return bmr * 1.9;
      default: return 0;
    }
  };

  // Function to calculate caloric intake goal 
  const calculateCaloricIntakeGoal = (tdee, goalValue) => {
    switch (goalValue) {
      case 1: return tdee * 0.85;
      case 2: return tdee;
      case 3: return tdee * 1.1;
      default: alert('Invalid goal selection.'); return 0;
    }
  };

  // Function to return activity level value
  const getActivityLevelValue = (activityLevel) => {
    switch (activityLevel) {
      case 'sedentary': return 1;
      case 'lightlyActive': return 2;
      case 'moderatelyActive': return 3;
      case 'veryActive': return 4;
      case 'extraActive': return 5;
      default: return 0;
    }
  };

  // Function to return weight goal value
  const getGoalValue = (goal) => {
    switch (goal) {
      case 'loseWeight': return 1;
      case 'maintainWeight': return 2;
      case 'gainMuscle': return 3;
      default: return 0;
    }
  };


  // Function to calculate vitamin and mineral goals based on user provided information
  const getNutrientValues = (gender, age, pregnancyStatus, caloricIntakeGoal) => {
    // Calculate all nutrient values based on NIH guidelines.
    const nutrientValues = {};

    nutrientValues.totalSugars = Math.round(0.1 * caloricIntakeGoal / 4);
    nutrientValues.addedSugars = Math.round(0.05 * caloricIntakeGoal / 4);
    nutrientValues.transFat = Math.round(0.01 * caloricIntakeGoal / 9);
    nutrientValues.saturatedFat = Math.round(0.09 * caloricIntakeGoal / 9);
    nutrientValues.polyunsaturatedFat = Math.round(0.1 * caloricIntakeGoal / 9);
    nutrientValues.monounsaturatedFat = Math.round(0.15 * caloricIntakeGoal / 9);

    if (gender === 'M') {
      nutrientValues.fiber = 38;
      if (age >= 19 && age <= 50) {
        nutrientValues.calcium = 1000;
        nutrientValues.iron = 8;
        nutrientValues.sodium = 2300;
        nutrientValues.vitaminA = 900;
        nutrientValues.vitaminC = 90;
        nutrientValues.vitaminD = 15;
        nutrientValues.potassium = 3400;
        nutrientValues.cholesterol = 200;
      } else if (age > 70) {
        nutrientValues.calcium = 1300;
        nutrientValues.sodium = 1500;
        nutrientValues.vitaminD = 20;
        nutrientValues.cholesterol = 200;
        nutrientValues.iron = 8;
        nutrientValues.potassium = 3400;
        nutrientValues.vitaminA = 900;
        nutrientValues.vitaminC = 90;
      } else if (age > 50) {
        nutrientValues.sodium = 1500;
        nutrientValues.cholesterol = 200;
        nutrientValues.calcium = 1000;
        nutrientValues.iron = 8;
        nutrientValues.potassium = 3400;
        nutrientValues.vitaminA = 900;
        nutrientValues.vitaminC = 90;
        nutrientValues.vitaminD = 15;
      }
    } else {
      nutrientValues.fiber = 25;
      if (pregnancyStatus === 'pregnant') {
        nutrientValues.calcium = 1000;
        nutrientValues.iron = 27;
        nutrientValues.vitaminA = 770;
        nutrientValues.vitaminC = 85;
        nutrientValues.vitaminD = 15;
        nutrientValues.potassium = 2900;
        nutrientValues.sodium = 2300;
        nutrientValues.cholesterol = 200;
      } else if (pregnancyStatus === 'breastfeeding') {
        nutrientValues.calcium = 1000;
        nutrientValues.iron = 9;
        nutrientValues.vitaminA = 1300;
        nutrientValues.vitaminC = 120;
        nutrientValues.vitaminD = 15;
        nutrientValues.potassium = 2800;
        nutrientValues.sodium = 2300;
        nutrientValues.cholesterol = 200;
      } else {
        if (age >= 19 && age <= 50) {
          nutrientValues.calcium = 1000;
          nutrientValues.iron = 18;
          nutrientValues.sodium = 2300;
          nutrientValues.cholesterol = 200;
          nutrientValues.vitaminA = 700;
          nutrientValues.vitaminC = 75;
          nutrientValues.vitaminD = 15;
          nutrientValues.potassium = 2600;
        } else if (age > 50) {
          nutrientValues.calcium = 1300;
          nutrientValues.sodium = 1500;
          nutrientValues.cholesterol = 200;
          nutrientValues.iron = 8;
          nutrientValues.potassium = 2600;
          nutrientValues.vitaminA = 700;
          nutrientValues.vitaminC = 75;
          nutrientValues.vitaminD = 15;
        } else if (age >= 14 && age <= 18) {
          nutrientValues.calcium = 1000;
          nutrientValues.cholesterol = 170;
          nutrientValues.sodium = 2300;
          nutrientValues.iron = 15;
          nutrientValues.vitaminA = 700;
          nutrientValues.vitaminC = 65;
          nutrientValues.vitaminD = 15;
        }
      }
    }

    // Iron and other specific values for ages 4-18
    if (age >= 4 && age <= 8) {
      nutrientValues.iron = 10;
      nutrientValues.calcium = 1000;
      nutrientValues.cholesterol = 170;
      nutrientValues.vitaminA = 400;
      nutrientValues.vitaminC = 25;
      nutrientValues.vitaminD = 15;
      nutrientValues.potassium = 2300;
      nutrientValues.sodium = 2200;
    } else if (age >= 9 && age <= 13) {
      nutrientValues.iron = 8;
      nutrientValues.cholesterol = 170;
      nutrientValues.calcium = 1300;
      nutrientValues.vitaminA = 600;
      nutrientValues.vitaminC = 45;
      nutrientValues.vitaminD = 15;
      nutrientValues.potassium = gender === 'M' ? 2500 : 2300;
      nutrientValues.sodium = 2500;
    } else if (age >= 14 && age <= 18) {
      nutrientValues.calcium = 1300;
      nutrientValues.cholesterol = 170;
      nutrientValues.potassium = gender === 'M' ? 3000 : 2300;
      nutrientValues.iron = gender === 'M' ? 11 : 15;
      nutrientValues.sodium = 2500;
      nutrientValues.vitaminA = gender === 'M' ? 900 : 700;
      nutrientValues.vitaminC = gender === 'M' ? 75 : 65;
      nutrientValues.vitaminD = 15;
    }

    return nutrientValues;
  };

  // Function to control height of animated header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, height * .064],
    outputRange: [height * .064, 0],
    extrapolate: 'clamp',
  });

  // Function to control opacity of animated header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.22],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Function to discard changes and navigate to previous screen
  const handleCancel = () => {
    Alert.alert(
      'Leave Screen?',
      'Are you sure want to cancel? This will discard all changes.',
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
  };

  // Function to manually dismiss the keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
    <View style={styles.topSafe}></View>
    <Animated.View style={[styles.collapsibleHeader, { height: headerHeight, opacity: headerOpacity }]}>
        <View style={styles.innerHeader}>
        <Text style={styles.title}>macros<Text style={styles.title2}>&</Text><Text style={styles.title}>more</Text></Text>
        </View>
      </Animated.View>      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" 
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <Text style={styles.firstLabel}>Weight (lbs):</Text>
          <TextInput
            style={styles.input}
            value={weightLbs}
            onChangeText={setWeightLbs}
            keyboardType="numeric"
            returnKeyType='done'
          />
          <Text style={styles.label}>Height:  </Text>
          <View style={styles.heightSection}>
          <TextInput
            style={styles.inputFeet}
            value={heightFeet}
            onChangeText={setHeightFeet}
            keyboardType="numeric"
            returnKeyType='done'
          />
          <Text style={styles.label}>  ft.</Text>
          <TextInput
            style={styles.inputInches}
            value={heightInches}
            onChangeText={setHeightInches}
            keyboardType="numeric"
            returnKeyType='done'
          />
          <Text style={styles.label}>  in.</Text>
          </View>
          <Text style={styles.label}>Age:</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            returnKeyType='done'
          />
          <Text style={styles.sectionLabel}>Gender:</Text>
          <View>
            <TouchableOpacity style={styles.button} 
            onPress={() => {
              setGender('M');
              setIsPregnantOrBreastfeeding(false);
              setPregnancyStatus('');
              handleKeyboardDismiss();
            }}>
              <Text style={{
                color: gender === 'M' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingTop: height * .005,
                paddingBottom: height * .016,
              }}
              >Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {setGender('F'); handleKeyboardDismiss();}}>
              <Text style={{
                color: gender === 'F' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
              }}
              >Female</Text>
            </TouchableOpacity>
          </View>
          {gender === 'F' && (
            <View>
              <Text style={styles.pregLabel}>Are you pregnant or breastfeeding?</Text>
              <TouchableOpacity style={styles.button} onPress={() => {setPregnancyStatus(''); handleKeyboardDismiss();}}>
                <Text style={{
                  color: pregnancyStatus === '' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                  fontSize: height * .019,
                  fontFamily: 'VarelaRound-Regular',
                  paddingTop: height * .008,
                  paddingBottom: height * .016,
                }}
                >No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => {setPregnancyStatus('pregnant'); handleKeyboardDismiss();}}>
                <Text style={{
                  color: pregnancyStatus === 'pregnant' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                  fontSize: height * .019,
                  fontFamily: 'VarelaRound-Regular',
                  paddingBottom: height * .016,
                }}
                >Pregnant</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => {setPregnancyStatus('breastfeeding'); handleKeyboardDismiss();}}>
                <Text style={{
                  color: pregnancyStatus === 'breastfeeding' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                  fontSize: height * .019,
                  fontFamily: 'VarelaRound-Regular',
                }}
                >Breastfeeding</Text>
              </TouchableOpacity>
              {pregnancyStatus === 'pregnant' && (
                <View>
                  <Text style={styles.pregLabel}>How far are you into your pregnancy?</Text>
                  <TouchableOpacity style={styles.button} onPress={() => {setTrimester('firstTrimester'); handleKeyboardDismiss();}}>
                    <Text style={{
                      color: trimester === 'firstTrimester' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                      fontSize: height * .019,
                      fontFamily: 'VarelaRound-Regular',
                      paddingTop: height * .008,
                      paddingBottom: height * .016,
                    }}
                    >First Trimester</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => {setTrimester('secondTrimester'); handleKeyboardDismiss();}}>
                    <Text style={{
                      color: trimester === 'secondTrimester' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                      fontSize: height * .019,
                      fontFamily: 'VarelaRound-Regular',
                      paddingBottom: height * .016,
                    }}
                    >Second Trimester</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => {setTrimester('thirdTrimester'); handleKeyboardDismiss();}}>
                    <Text style={{
                      color: trimester === 'thirdTrimester' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                      fontSize: height * .019,
                      fontFamily: 'VarelaRound-Regular',
                      paddingBottom: height * .016,
                    }}
                    >Third Trimester</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          <Text style={styles.sectionLabel}>Activity Level:</Text>
          <View>
            <TouchableOpacity style={styles.button} onPress={() => {setActivityLevel('sedentary'); handleKeyboardDismiss();}}>
              <Text style={{
                color: activityLevel === 'sedentary' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingTop: height * .01,
                paddingBottom: height * .016,
              }}
              >Sedentary (No exercise)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {setActivityLevel('lightlyActive'); handleKeyboardDismiss();}}>
              <Text style={{
                color: activityLevel === 'lightlyActive' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingBottom: height * .016,
              }}
              >Lightly Active (1-3 days per week)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {setActivityLevel('moderatelyActive'); handleKeyboardDismiss();}}>
              <Text style={{
                color: activityLevel === 'moderatelyActive' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingBottom: height * .016,
              }}
              >Moderately Active (3-5 days per week)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {setActivityLevel('veryActive'); handleKeyboardDismiss();}}>
              <Text style={{
                color: activityLevel === 'veryActive' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingBottom: height * .016,
              }}
              >Very Active (6-7 days per week)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {setActivityLevel('extraActive'); handleKeyboardDismiss();}}>
              <Text style={{
                color: activityLevel === 'extraActive' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingBottom: height * .013,
              }}
              >Extremely Active (Twice daily)</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionLabel}>Goal:</Text>
          <View>
            <TouchableOpacity style={styles.button} onPress={() => {setGoal('loseWeight'); handleKeyboardDismiss();}}>
              <Text style={{
                color: goal === 'loseWeight' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingTop: height * .005,
                paddingBottom: height * .016,
              }}
              >Lose Weight (Cut)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}onPress={() => {setGoal('maintainWeight'); handleKeyboardDismiss();}}>
              <Text style={{
                color: goal === 'maintainWeight' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
                paddingBottom: height * .016,
              }}
              >Maintain Weight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {setGoal('gainMuscle'); handleKeyboardDismiss();}}>
              <Text style={{
                color: goal === 'gainMuscle' ? colorScheme === 'dark' ? 'white' : '#7323eb' : 'gray',
                fontSize: height * .019,
                fontFamily: 'VarelaRound-Regular',
              }}
              >Gain Weight (Bulk)</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptySpace}></View>

          <TouchableOpacity style={[styles.calculateButton, isLoading && { opacity: 0.5 }]}  
          onPress={calculateNutrients} disabled={isLoading}>
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>


        {dailyCalorieGoal !== null && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleCancel}>
            <Text style={styles.deleteText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        </View>
      </TouchableWithoutFeedback>
      </Animated.ScrollView>
      <View style={styles.bottomSafe}></View>
    </View>
  );
};

const dynamicStyles = (colorScheme, insets, isSmall) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
  fixedHeader: {
    height: 60,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#eeedf0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 4,
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  collapsibleHeader: {
    position: 'absolute',
    top: isSmall ? height * .035 : height * .062,
    left: 0,
    right: 0,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
    zIndex: 1000,
    elevation: 4,
    alignItems: 'center',
  },
  innerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: height * .017,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'VarelaRound-Regular',
    color: colorScheme === 'dark' ? 'white' : '#7323eb',
    fontSize: height * .0365,
    top: height * -.0085,
    marginBottom: height * -.011,
  },
  title2: {
      textAlign: 'center',
      fontFamily: 'RoundedMplus1c-Bold',
      color: colorScheme === 'dark' ? 'white' : '#7323eb',
      fontSize: height * .028,
  },
  scrollViewContent: {
    paddingHorizontal: height * .017,
    paddingTop: height * .064,
  },
  firstLabel: {
    paddingTop: height * .005,
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
    marginBottom: height * .0085,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  label: {
    paddingTop: height * .011,
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
    marginBottom: height * .0085,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  sectionLabel: {
    paddingTop: height * .011,
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
    marginTop: height * .011,
    marginBottom: height * .0085,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  pregLabel: {
    textAlign: 'center',
    paddingTop: height * .022,
    fontSize: height * .017,
    fontFamily: 'Quicksand-Bold',
    marginBottom: height * .0085,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: height * .0085,
    marginBottom: height * .011,
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  heightSection: {
    flexDirection: 'row',
  },
  inputFeet: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: height * .0085,
    paddingHorizontal: width * .05,
    width: width * .2,
    marginBottom: height * .011,
    marginLeft: 0,
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  inputInches: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: height * .0085,
    paddingHorizontal: width * .05,
    width: width * .2,
    marginLeft: height * .022,
    marginBottom: height * .011,
    textAlign: 'center',
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  button: {
    alignSelf: 'center',
  },
  calculateButton: {
    backgroundColor: '#7323eb',
    padding: height * .011,
    marginTop: height * .011,
    marginBottom: height * .022,
    borderRadius: 5,
    alignItems: 'center',
  },
  calculateButtonText: {
      fontFamily: 'Quicksand-Bold',
      color: '#fff',
      fontSize: height * .017,
  },
  deleteButton: {
    marginBottom: height * .018,
    alignSelf: 'center',
  },
  deleteText: {
    color: '#fe0000',
    fontSize: height * .018,
    fontFamily: 'Quicksand-Bold',
  },
  emptySpace: {
    paddingTop: height * .048,
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
});

export default MacroCalculatorScreen;
