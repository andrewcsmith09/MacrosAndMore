import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * DailyTotalDetailsScreen
 *
 * Displays a detailed breakdown of the user's daily nutrient intake compared to their personalized daily goals.
 * It shows values for calories, macronutrients, vitamins, and minerals, along with units and percentage progress.
 * It is accessed after logging food and selecting a specific day's nutrition summary.
 */

const DailyTotalDetailsScreen = ({ route, navigation }) => {
  const { dailyTotals, user } = route.params;
  const calories = dailyTotals?.calories
  const protein = dailyTotals?.protein;
  const carbs = dailyTotals?.carbs;
  const fat = dailyTotals?.fat;
  const totalSugars = dailyTotals?.totalSugars;
  const addedSugars = dailyTotals?.addedSugars;
  const cholesterol = dailyTotals?.cholesterol;
  const transFat = dailyTotals?.transFat;
  const saturatedFat = dailyTotals?.saturatedFat;
  const polyunsaturatedFat = dailyTotals?.polyunsaturatedFat;
  const monounsaturatedFat = dailyTotals?.monounsaturatedFat;
  const fiber = dailyTotals?.fiber;
  const calcium = dailyTotals?.calcium;
  const iron = dailyTotals?.iron;
  const sodium = dailyTotals?.sodium;
  const potassium = dailyTotals?.potassium;
  const vitaminA = dailyTotals?.vitaminA;
  const vitaminC = dailyTotals?.vitaminC;
  const vitaminD = dailyTotals?.vitaminD;

  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); 
  const { width, height } = useWindowDimensions();
  const styles = dynamicStyles(colorScheme, width, height, insets);

  // Function to convert values to desired display format
  const formatNumber = (value) => {    
    // Round the number to one decimal place
    const roundedValue = Math.round(value * 10) / 10;
  
    // If the rounded value is an integer, return as whole number
    if (Number.isInteger(roundedValue)) {
      return roundedValue.toString();
    } else {
      // Otherwise return rounded to one decimal place
      return roundedValue.toFixed(1); 
    }
  };

  // Function to calculate progress percentage
  const calculatePercentage = (value, goal) => {
    // If goal exists, return the percentage formatted to one decimal place
    if (goal > 0) {
      return ((value / goal) * 100).toFixed(); 
    }
    // Return 0 if the goal is 0 to avoid division by zero
    return '0'; 
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerContainer}>
        <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Today's Totals</Text>
        </View>

        <Text style={styles.percentLabel}>% of </Text>
        <View style={styles.labelView}>
          <Text style={styles.percentLabel2}>daily goal</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
              <Text style={styles.details}>Calories: </Text>
              <View style={styles.valueContainer}>
                  <Text style={styles.detailValues}>{calories?.toFixed()}</Text>    
                  <Text style={styles.detailsPercent2}>{calculatePercentage(calories, user.dailyCalorieGoal)}%</Text>
              </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Protein: </Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(protein)} g</Text>
                <Text style={styles.detailsPercent}>{calculatePercentage(protein, user.dailyProteinGoal)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Total Carbs:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(carbs)} g</Text>
                <Text style={styles.detailsPercent}>{calculatePercentage(carbs, user.dailyCarbsGoal)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details2}>Fiber:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues2}>{formatNumber(fiber)} g</Text> 
                <Text style={styles.detailsPercent}>{calculatePercentage(fiber, user.fiber)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details2}>Total Sugars:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues2}>{formatNumber(totalSugars)} g</Text>
                <Text style={styles.detailsPercent}>{calculatePercentage(totalSugars, user.totalSugars)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details2}>Added Sugars:</Text>
                <View style={styles.valueContainer}>
                <Text style={styles.detailValues2}>{formatNumber(addedSugars)} g</Text>
                <Text style={styles.detailsPercent}>{calculatePercentage(addedSugars, user.addedSugars)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Total Fat:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(fat)} g</Text>
                <Text style={styles.detailsPercent}>{calculatePercentage(fat, user.dailyFatGoal)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details2}>Saturated Fat:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues2}>{formatNumber(saturatedFat)} g</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(saturatedFat, user.saturatedFat)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details2}>Trans Fat:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues2}>{formatNumber(transFat)} g</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(transFat, user.transFat)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details2}>Polyunsaturated Fat:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues2}>{formatNumber(polyunsaturatedFat)} g</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(polyunsaturatedFat, user.polyunsaturatedFat)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details2}>Monounsaturated Fat:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues2}>{formatNumber(monounsaturatedFat)} g</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(monounsaturatedFat, user.monounsaturatedFat)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Cholesterol:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(cholesterol)} mg</Text>
                <Text style={styles.detailsPercent}>{calculatePercentage(cholesterol, user.cholesterol)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Sodium:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(sodium)} mg</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(sodium, user.sodium)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Potassium:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(potassium)} mg</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(potassium, user.potassium)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Calcium:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(calcium)} mg</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(calcium, user.calcium)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Iron:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(iron)} mg</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(iron, user.iron)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Vitamin A:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(vitaminA)} mcg</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(vitaminA, user.vitaminA)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Vitamin C:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(vitaminC)} mg</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(vitaminC, user.vitaminC)}%</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.details}>Vitamin D:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.detailValues}>{formatNumber(vitaminD)} mcg</Text>    
                <Text style={styles.detailsPercent}>{calculatePercentage(vitaminD, user.vitaminD)}%</Text>
            </View>
          </View>
        </View>
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
  );
};

const dynamicStyles = (colorScheme, width, height, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backContainer: {
    padding: 10,
  },
  backButton: { 
    top: height * .002,
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .018,
    color: '#7323eb',
  },
  title: {
    textAlign: 'center',
    fontSize: height * .023,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    paddingHorizontal: 20,
    marginBottom: height * .01,
  },
  nutrients: {
    textAlign: 'center',
    fontSize: height * 0.016,
    fontFamily: 'VarelaRound-Regular',
    paddingTop: height * .005,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  servingText: {
    fontSize: height * 0.016,
    fontFamily: 'VarelaRound-Regular',
    textAlign: 'center',
    paddingTop: height * .005,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  detailsContainer: {
    paddingHorizontal: 25,
    flex: 1,
  },
  labelView: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingBottom: height * .015,
  },
  percentLabel: {
    textAlign:'right',
    fontFamily: 'Quicksand-Bold',
    fontSize: insets.bottom === 0 ? height * .0155 : height * 0.014,
    color: colorScheme === 'dark' ? '#c9c9c9' : '#706f6f',
    paddingTop: height * .015,
    paddingRight: 27,
  },
  percentLabel2: {
    textAlign:'right',
    fontFamily: 'Quicksand-Bold',
    fontSize: insets.bottom === 0 ? height * .0155 : height * 0.014,
    color: colorScheme === 'dark' ? '#c9c9c9' : '#706f6f',
    paddingRight: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * .004,
  },
  details: {
    fontSize: insets.bottom === 0 ? height * .0175 : height * 0.016,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    paddingBottom: height * 0.006,
    flex: 1,
  },
  details2: {
    fontSize: insets.bottom === 0 ? height * .0175 : height * 0.016,
    fontFamily: 'Quicksand-Bold',
    textAlign: 'left',
    paddingLeft: width * .07,
    paddingBottom: height * 0.006,
    color: colorScheme === 'dark' ? '#cfcfcf' : '#404040',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  detailValues: {
    fontSize: insets.bottom === 0 ? height * .017 : height * 0.0155,
    fontFamily: 'RoundedMplus1c-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    width: 80,
    paddingBottom: height * 0.006,
    textAlign: 'right',
  },
  detailValues2: {
    fontSize: insets.bottom === 0 ? height * .017 : height * 0.0155,
    fontFamily: 'RoundedMplus1c-Bold',
    color: colorScheme === 'dark' ? '#cfcfcf' : '#404040',
    width: 80, 
    paddingBottom: height * 0.006,
    textAlign: 'right',
  },
  detailsPercent: {
    fontSize: insets.bottom === 0 ? height * .0185 : height * 0.017,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? '#c9c9c9' : '#706f6f',
    width: width * .15,
    top: height * .0011,
    textAlign: 'right',
  },
  detailsPercent2: {
    fontSize: insets.bottom === 0 ? height * .0175 : height * 0.0165,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? '#c9c9c9' : '#706f6f',
    width: width * .15,
    textAlign: 'right',
  },
  bottomIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderColor: 'lightgrey',
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

export default DailyTotalDetailsScreen;