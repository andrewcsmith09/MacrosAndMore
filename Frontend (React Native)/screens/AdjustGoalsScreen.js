import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity,
 KeyboardAvoidingView, Platform, useColorScheme, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axiosInstance from '../../Config/axios_config';

/**
 * AdjustGoalsScreen
 *
 * Allows users to adjust their daily nutritional goals, including calories, macronutrients, and other micronutrients.
 * It provides an editable interface where users can input their desired goals for protein, carbs, fats, etc.
 * Users can save their changes, which are validated to ensure all inputs are valid and percentages for macronutrients add up to 100%.
 * This screen is part of the user profile management and can be accessed from the settings menu.
 */

const AdjustGoalsScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [calories, setCalories] = useState(user.dailyCalorieGoal);
  const [proteinPercent, setProteinPercent] = useState((((user.dailyProteinGoal*4)/user.dailyCalorieGoal)*100).toFixed());
  const [carbsPercent, setCarbsPercent] = useState((((user.dailyCarbsGoal*4)/user.dailyCalorieGoal)*100).toFixed());
  const [fatPercent, setFatPercent] = useState((((user.dailyFatGoal*9)/user.dailyCalorieGoal)*100).toFixed());
  const [totalSugars, setTotalSugars] = useState(user.totalSugars);
  const [addedSugars, setAddedSugars] = useState(user.addedSugars);
  const [transFat, setTransFat] = useState(user.transFat);
  const [saturatedFat, setSaturatedFat] = useState(user.saturatedFat);
  const [polyunsaturatedFat, setPolyunsaturatedFat] = useState(user.polyunsaturatedFat);
  const [monounsaturatedFat, setMonounsaturatedFat] = useState(user.monounsaturatedFat);
  const [cholesterol, setCholesterol] = useState(user.cholesterol);
  const [fiber, setFiber] = useState(user.fiber);
  const [calcium, setCalcium] = useState(user.calcium);
  const [iron, setIron] = useState(user.iron);
  const [sodium, setSodium] = useState(user.sodium);
  const [potassium, setPotassium] = useState(user.potassium);
  const [vitaminA, setVitaminA] = useState(user.vitaminA);
  const [vitaminC, setVitaminC] = useState(user.vitaminC);
  const [vitaminD, setVitaminD] = useState(user.vitaminD);
  const [water, setWater] = useState((user.water / 29.5735).toFixed());
  
  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const { width, height } = Dimensions.get('window'); 
  const styles = dynamicStyles(colorScheme, insets, width, height);

  useEffect(() => {
    // Display info message when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      Alert.alert(
        'Nutrient Goals Information',
        'Nutrient goals are based on standard NIH guidelines tailored to your height, weight, sex, age, and pregnancy status. ' +
        'However, these values may not be suitable for everyone. Please consult a healthcare provider or do your own research ' +
        'before making any changes.');    
    });

    return unsubscribe;
  }, [navigation, user]);

  // Function to save updated nutritional goals
  const handleSave = () => {
    // Convert given percentages to caloric values
    let newProtein = ((calories/4)*(proteinPercent/100)).toFixed();
    let newCarbs = ((calories/4)*(carbsPercent/100)).toFixed();
    let newFat = ((calories/9)*(fatPercent/100)).toFixed();

    const inputs = [
      calories, newProtein, newCarbs, newFat, totalSugars, addedSugars,
      transFat, saturatedFat, polyunsaturatedFat, monounsaturatedFat,
      cholesterol, fiber, calcium, iron, sodium, potassium,
      vitaminA, vitaminC, vitaminD, water
    ];

    // Check for empty entries and ensure values are integers
    for (const input of inputs) {
      if (input === '' || input === null || input === undefined || !Number.isInteger(Number(input))) {
          Alert.alert('Invalid Input', 'All goals must be valid whole numbers. No empty entries.');
          return;
      }
    }

    // Ensure macro percentages add to 100%
    if ((Number(proteinPercent) + Number(carbsPercent) + Number(fatPercent)) != 100) {
      Alert.alert('Invalid Macro Input', 'Protein, carbs & fat percentages must add up to 100%.')
      return;
    }
    
    // Display a confirmation alert before saving
    Alert.alert(
      'Confirm Save',
      'Are you sure you want to save these changes?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: () => {
            const updatedUser = {
              id: user.id, 
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              passwordHash: user.passwordHash,
              dailyCalorieGoal: calories,
              dailyProteinGoal: newProtein,
              dailyCarbsGoal: newCarbs,
              dailyFatGoal: newFat,
              totalSugars: totalSugars,
              addedSugars: addedSugars,
              fiber: fiber,
              calcium: calcium,
              iron: iron,
              sodium: sodium,
              vitaminA: vitaminA,
              vitaminC: vitaminC,
              vitaminD: vitaminD,
              cholesterol: cholesterol,
              transFat: transFat,
              saturatedFat: saturatedFat,
              polyunsaturatedFat: polyunsaturatedFat,
              monounsaturatedFat: monounsaturatedFat,
              potassium: potassium,
              water: (water*29.5735)
            };
            // Perform the update request
            axiosInstance.put('/api/users/update', updatedUser)
              .then(response => {
                Alert.alert('Update Successful', 'Your goals have been adjusted.');
                navigation.navigate('Home', { username: user.username });
              })
              .catch(error => {
                console.error('Error updating goals:', error);
                Alert.alert('Error', 'Failed to update goals. Please try again later.');
              });
            },
          },
        ],
      { cancelable: true }
    );
  };

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

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.topSafe}></View> 
  
        <View style={styles.innerHeader}>
          <TouchableOpacity style={styles.mealButton} onPress={handleCancel}>
            <Text style={styles.backButton}>{'< Back    '}</Text>
          </TouchableOpacity>
            <Text style={styles.title}>Adjust Daily Goals</Text>
        </View>

        <KeyboardAwareScrollView
          style={styles.scrollContainer}
          keyboardOpeningTime={0}
          extraScrollHeight={125}
          showsVerticalScrollIndicator={false}
          enableResetScrollToCoords={false}
          keyboardShouldPersistTaps="handled" 
          contentInset={{ bottom: -10 }}
        >
          <View style={styles.extraSpace}></View>

          <Text style={styles.label}>Calories:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Calories"
            value={calories.toString()}
            onChangeText={text => setCalories(text)}
            returnKeyType='done'
          />

          <View style={styles.macrosRow}>
            <View style={styles.macrosCol}>
              <Text style={styles.label}>Protein:</Text>
              <TextInput
                style={styles.macrosInput}
                keyboardType="numeric"
                value={proteinPercent.toString()}
                onChangeText={text => setProteinPercent(text)}
                returnKeyType='done'
              />
            </View>
            <Text style={styles.percentLabel}>%</Text>

            <View style={styles.macrosCol}>
              <Text style={styles.label}>Carbs:</Text>
              <TextInput
                style={styles.macrosInput}
                keyboardType="numeric"
                value={carbsPercent.toString()}
                onChangeText={text => setCarbsPercent(text)}
                returnKeyType='done'
              />
            </View>
            <Text style={styles.percentLabel}>%</Text>

            <View style={styles.macrosCol}>
              <Text style={styles.label}>Fat:</Text>
              <TextInput
                style={styles.macrosInput}
                keyboardType="numeric"
                value={fatPercent.toString()}
                onChangeText={text => setFatPercent(text)}
                returnKeyType='done'
              />
            </View>
            <Text style={styles.percentLabel}>%</Text>
          </View>

          <Text style={styles.label}>Fiber (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Fiber (g)"
            keyboardType="numeric"
            value={fiber.toString()}
            onChangeText={text => setFiber(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Total Sugars (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Total Sugars (g)"
            keyboardType="numeric"
            value={totalSugars.toString()}
            onChangeText={text => setTotalSugars(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Added Sugars (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Added Sugars (g)"
            keyboardType="numeric"
            value={addedSugars.toString()}
            onChangeText={text => setAddedSugars(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Saturated Fat (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Saturated Fat (g)"
            keyboardType="numeric"
            value={saturatedFat.toString()}
            onChangeText={text => setSaturatedFat(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Trans Fat (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Trans Fat (g)"
            keyboardType="numeric"
            value={transFat.toString()}
            onChangeText={text => setTransFat(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Polyunsaturated Fat (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Polyunsaturated Fat (g)"
            keyboardType="numeric"
            value={polyunsaturatedFat.toString()}
            onChangeText={text => setPolyunsaturatedFat(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Monounsaturated Fat (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Monounsaturated Fat (g)"
            keyboardType="numeric"
            value={monounsaturatedFat.toString()}
            onChangeText={text => setMonounsaturatedFat(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Cholesterol (mg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Cholesterol (mg)"
            keyboardType="numeric"
            value={cholesterol.toString()}
            onChangeText={text => setCholesterol(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Sodium (mg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Sodium (mg)"
            keyboardType="numeric"
            value={sodium.toString()}
            onChangeText={text => setSodium(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Potassium (mg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Potassium (mg)"
            keyboardType="numeric"
            value={potassium.toString()}
            onChangeText={text => setPotassium(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Calcium (mg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Calcium (mg)"
            keyboardType="numeric"
            value={calcium.toString()}
            onChangeText={text => setCalcium(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Iron (mg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Iron (mg)"
            keyboardType="numeric"
            value={iron.toString()}
            onChangeText={text => setIron(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Vitamin A (mcg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Vitamin A (mcg)"
            keyboardType="numeric"
            value={vitaminA.toString()}
            onChangeText={text => setVitaminA(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Vitamin C (mg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Vitamin C (mg)"
            keyboardType="numeric"
            value={vitaminC.toString()}
            onChangeText={text => setVitaminC(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Vitamin D (mcg):</Text>
          <TextInput
            style={styles.input}
            placeholder="Vitamin D (mcg)"
            keyboardType="numeric"
            value={vitaminD.toString()}
            onChangeText={text => setVitaminD(text)}
            returnKeyType='done'
          />

          <Text style={styles.label}>Water (oz.):</Text>
          <TextInput
            style={styles.input}
            placeholder="Water (oz.)"
            keyboardType="numeric"
            value={water.toString()} // Convert to ounces for display
            onChangeText={text => setWater(text)}
            returnKeyType='done'
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Submit Daily Goals</Text>
          </TouchableOpacity>

          <View style={styles.extraSpace}></View>
          
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomSafe}></View>
    </View>
  );
};
    
const dynamicStyles = (colorScheme, insets, width, height) => StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#faf7f7',
  },
  scrollContainer: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 15,
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
  content: {
    flex: 1,
    padding: 15,
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
    color: colorScheme === 'dark' ? 'white' : '#7323eb',
    fontSize: height * .02575,
    top: height * -.01,
    marginBottom: height * -.028,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: height * .01,
    paddingHorizontal: height * .04,
    paddingBottom: height * .015,
    marginRight: height * .015,
  },
  macrosCol: {
    alignItems: 'center',
  },
  label: {
    fontSize: height * .0175,
    fontFamily: 'VarelaRound-Regular',
    fontWeight: 'bold',
    paddingBottom: height * .006,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  macrosInput: {
    height: height * .0425,
    width: width * .2,
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .015,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: height * .011,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  percentLabel: {
    fontSize: height * .0175,
    fontFamily: 'VarelaRound-Regular',
    marginTop: height * .038,
    marginLeft: width * -.15,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  input: {
    height: height * .0425,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .015,
    paddingHorizontal: 10,
    marginBottom: height * .011,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  button: {
    backgroundColor: '#7323eb',
    padding:  height * .011,
    marginTop: height * .01,
    marginBottom: height * .05,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
      fontFamily: 'Quicksand-Bold',
      color: '#fff',
      fontSize: height * .0175,
  },
  extraSpace: {
    paddingTop: height * .01, 
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
});

export default AdjustGoalsScreen;