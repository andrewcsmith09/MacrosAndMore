import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Modal, KeyboardAvoidingView, 
  Platform, useColorScheme, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axiosInstance from '../../Config/axios_config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';

/**
 * UpdateFoodScreen
 * 
 * Provides a user interface for editing and updating nutritional information of a selected food item. 
 * Fetches current food details and populates editable fields including name, brand, serving size, calories, 
 * macronutrients, and micronutrients. Supports unit selection with dynamic conversion between grams, ounces, and milliliters. 
 * Validates required inputs before saving and updates backend via API call. 
 * Confirms with the user before discarding unsaved changes. 
 * Can be accessed by selecting the edit option on the details page of a custom food item.
 */

const UpdateFoodScreen = ({ route, navigation }) => {
  const { user, foodItemId } = route.params;
  const [foodItem, setFoodItem] = useState({});
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [protein, setProtein] = useState('');
  const [originalServingSize, setOriginalServingSize] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servingSizeUnit, setServingSizeUnit] = useState('g');
  const [servingText, setServingText] = useState('');
  const [totalSugars, setTotalSugars] = useState('');
  const [fiber, setFiber] = useState('');
  const [calcium, setCalcium] = useState('');
  const [iron, setIron] = useState('');
  const [sodium, setSodium] = useState('');
  const [vitaminA, setVitaminA] = useState('');
  const [vitaminC, setVitaminC] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [transFat, setTransFat] = useState('');
  const [saturatedFat, setSaturatedFat] = useState('');
  const [polyunsaturatedFat, setPolyunsaturatedFat] = useState('');
  const [monounsaturatedFat, setMonounsaturatedFat] = useState('');
  const [potassium, setPotassium] = useState('');
  const [addedSugars, setAddedSugars] = useState('');
  const [vitaminD, setVitaminD] = useState('');
  const [items, setItems] = useState([
    {label: 'g', value: 'g'},
    {label: 'oz', value: 'oz'},
    {label: 'ml', value: 'ml'}
  ]);

  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme();
  const { width, height } = Dimensions.get('window'); 
  const styles = dynamicStyles(colorScheme, insets, width, height);

  // Function to retrieve food item and set nutritional values 
  useEffect(() => {
    // Send request to retrieve food item data
    axiosInstance.get(`/api/food/${foodItemId}`)
      .then(response => {
        const data = response.data;

        // Extract the brand from the name
        const nameMatch = data.name.match(/\(([^)]+)\)/);
        const extractedBrand = nameMatch ? nameMatch[1] : ''; // Get the brand or set as empty if not found

        // Convert serving size to grams
        let grams = 0;
        if (data.servingSizeUnit === 'oz') {
          grams = data.originalServingSize * 28.35; // Convert oz to grams
        } else if (data.servingSizeUnit === 'g') {
          grams = data.originalServingSize;
        } else if (data.servingSizeUnit === 'ml') {
          grams = data.originalServingSize;
        }
  
        // Set the states with converted values
        setFoodItem(data);
        setName(data.name.replace(/\s*\(.*\)/, '').trim() || '');
        setBrand(extractedBrand);
        setCalories(String(((data.calories || 0) * (grams || 0)).toFixed()));
        setCarbs(String(formatNumber((data.carbs || 0) * (grams || 0))));
        setFat(String(formatNumber((data.fat || 0) * (grams || 0))));
        setProtein(String(formatNumber((data.protein || 0) * (grams || 0))));
        setServingSize(String(formatNumber(data.originalServingSize || 0)));
        setServingSizeUnit(data.servingSizeUnit || 'g');
        setServingText(data.servingText || '');
        setTotalSugars(String(formatNumber((data.totalSugars || 0) * (grams || 0))));
        setFiber(String(formatNumber((data.fiber || 0) * (grams || 0))));
        setCalcium(String(formatNumber((data.calcium || 0) * (grams || 0))));
        setIron(String(formatNumber((data.iron || 0) * (grams || 0))));
        setSodium(String(formatNumber((data.sodium || 0) * (grams || 0))));
        setVitaminA(String(formatNumber((data.vitaminA || 0) * (grams || 0))));
        setVitaminC(String(formatNumber((data.vitaminC || 0) * (grams || 0))));
        setCholesterol(String(formatNumber((data.cholesterol || 0) * (grams || 0))));
        setTransFat(String(formatNumber((data.transFat || 0) * (grams || 0))));
        setSaturatedFat(String(formatNumber((data.saturatedFat || 0) * (grams || 0))));
        setPolyunsaturatedFat(String(formatNumber((data.polyunsaturatedFat || 0) * (grams || 0))));
        setMonounsaturatedFat(String(formatNumber((data.monounsaturatedFat || 0) * (grams || 0))));
        setPotassium(String(formatNumber((data.potassium || 0) * (grams || 0))));
        setAddedSugars(String(formatNumber((data.addedSugars || 0) * (grams || 0))));
        setVitaminD(String(formatNumber((data.vitaminD || 0) * (grams || 0))));
      })
      .catch(error => {
        console.error('Error fetching food item details:', error);
      });
  }, [foodItemId]);

  // Function to save updated food item
  const handleSave = () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); 

    // Check if required fields are filled
    if (!name || !calories || !servingSize) {
      Alert.alert('Invalid Food Item', 'Food Name, Calories & Serving Size fields must all be filled out.');
      setIsLoading(false);  
      return;
    }

    let updatedServingSize; 

    if (servingSizeUnit === 'oz') {
        updatedServingSize = servingSize * 28.3495;
    } else {
        updatedServingSize = servingSize;
    }

    // Prepare data for the POST request
    const newFoodItem = {
      userId: user.id,
      name: brand ? `${name} (${brand})` : name,
      calories: parseFloat(calories/updatedServingSize) || 0,
      carbs: parseFloat(carbs/updatedServingSize) || 0,
      fat: parseFloat(fat/updatedServingSize) || 0,
      protein: parseFloat(protein/updatedServingSize) || 0,
      originalServingSize: parseFloat(servingSize) || 0,
      servingSize: parseFloat(updatedServingSize) || 0,
      servingSizeUnit: servingSizeUnit,
      servingText: servingText,
      totalSugars: parseFloat(totalSugars/updatedServingSize) || 0,
      fiber: parseFloat(fiber/updatedServingSize) || 0,
      calcium: parseFloat(calcium/updatedServingSize) || 0,
      iron: parseFloat(iron/updatedServingSize) || 0,
      sodium: parseFloat(sodium/updatedServingSize) || 0,
      vitaminA: parseFloat(vitaminA/updatedServingSize) || 0,
      vitaminC: parseFloat(vitaminC/updatedServingSize) || 0,
      cholesterol: parseFloat(cholesterol/updatedServingSize) || 0,
      transFat: parseFloat(transFat/updatedServingSize) || 0,
      saturatedFat: parseFloat(saturatedFat/updatedServingSize) || 0,
      polyunsaturatedFat: parseFloat(polyunsaturatedFat/updatedServingSize) || 0,
      monounsaturatedFat: parseFloat(monounsaturatedFat/updatedServingSize) || 0,
      potassium: parseFloat(potassium/updatedServingSize) || 0,
      addedSugars: parseFloat(addedSugars/updatedServingSize) || 0,
      vitaminD: parseFloat(vitaminD/updatedServingSize) || 0,
    };

    // Send request to update food item
    axiosInstance.put(`/api/food/update/${foodItemId}`, newFoodItem)
      .then(response => {
        Alert.alert('Success', 'Food item updated successfully!');
        navigation.goBack(); // Navigate to previous screen
      })
      .catch(error => {
        console.error('Error updating food item:', error);
        Alert.alert('Error', 'Failed to update food item.');
        setIsLoading(false);  
      });
  };

  // Function to discard changes and navigate to previous screen
  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to leave screen? Changes will not be saved.',
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

  // Function to convert value to desired display format
  const formatNumber = (value) => {
    // Round the number to one decimal place
    const roundedValue = Math.round(value * 10) / 10;
  
    // Check if the rounded value is an integer
    if (Number.isInteger(roundedValue)) {
      return roundedValue.toString(); // Return as whole number
    } else {
      return roundedValue.toFixed(1); // Return with one decimal place
    }
  }

  // Function to close serving unit picker
  handleClosePicker = () => {
    setOpen(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

            <Text style={styles.title}>Update Food Item</Text>
          </View>

          <KeyboardAwareScrollView
            style={styles.scrollContainer}
            keyboardOpeningTime={0}
            extraScrollHeight={119}
            showsVerticalScrollIndicator={false}
            enableResetScrollToCoords={false}
            keyboardShouldPersistTaps="handled" 
            contentInset={{ bottom: -10 }}
          >
            <View style={styles.content}>
              <View style={styles.topEmpty}></View>

              <Text style={styles.label}>Brand Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Brand Name"
                value={brand}
                onChangeText={text => setBrand(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Food's Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="*Food's Name"
                value={name}
                onChangeText={text => setName(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Serving Size:</Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="*Serving Amount"
                  keyboardType="numeric"
                  returnKeyType="done"
                  value={servingSize}
                  onChangeText={text => setServingSize(text)}
                  onFocus={handleClosePicker}
                />

                <TouchableOpacity style={styles.dropdownWrapper} onPress={() => {setOpen(prev => !prev); Keyboard.dismiss();}}>
                  <View style={styles.dropdownButton}>
                    <Text style={styles.unitText}>
                      {items.find(item => item.value === servingSizeUnit)?.label || "Select Unit"}
                    </Text>
                    {open ? <Text style={styles.dropdownArrow}>▲</Text> :
                    <Text style={styles.dropdownArrow}>▼</Text>}
                  </View>
                </TouchableOpacity>
              </View>

              {open && (
                <Modal
                  transparent={true}
                  animationType="fade"
                  visible={open}
                  onRequestClose={() => setOpen(false)}
                >
                  <TouchableOpacity style={styles.backdrop} onPress={() => setOpen(false)}>
                    <View style={styles.dropdownContainer}>
                      <DropDownPicker
                        open={open}
                        value={servingSizeUnit}
                        items={items}
                        setOpen={setOpen}
                        setValue={setServingSizeUnit}
                        setItems={setItems}
                        containerStyle={styles.dropdown}
                        style={styles.dropdownStyle}
                        dropDownContainerStyle={styles.dropdownStyle}
                        labelStyle={styles.dropdownLabel}
                        textStyle={styles.dropdownLabel}
                        arrowIconContainerStyle={styles.dropdownLabel}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}

              <Text style={styles.restartLabel}>Serving Description:</Text> 
              <TextInput
                style={styles.restartInput}
                placeholder="Serving Description (ex. 1 slice or cup)"
                returnKeyType="done"
                value={servingText}
                onChangeText={text => setServingText(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Calories:</Text>
              <TextInput
                style={styles.input}
                placeholder="*Calories (kcal)"
                keyboardType="numeric"
                returnKeyType="done"
                value={calories}
                onChangeText={text => setCalories(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Protein:</Text>
              <TextInput
                style={styles.input}
                placeholder="Protein (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={protein}
                onChangeText={text => setProtein(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Total Carbs:</Text>
              <TextInput
                style={styles.input}
                placeholder="Carbohydrates (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={carbs}
                onChangeText={text => setCarbs(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Fiber:</Text>
              <TextInput
                style={styles.input}
                placeholder="Fiber (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={fiber}
                onChangeText={text => setFiber(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Total Sugars:</Text> 
              <TextInput
                style={styles.input}
                placeholder="Total Sugars (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={totalSugars}
                onChangeText={text => setTotalSugars(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Added Sugars:</Text>
              <TextInput
              style={styles.input}
              placeholder="Added Sugars (g)"
              keyboardType="numeric"
              returnKeyType="done"
              value={addedSugars}
              onChangeText={text => setAddedSugars(text)}
              onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Total Fat:</Text>
              <TextInput
                style={styles.input}
                placeholder="Total Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={fat}
                onChangeText={text => setFat(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Saturated Fat:</Text>
              <TextInput
                style={styles.input}
                placeholder="Saturated Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={saturatedFat}
                onChangeText={text => setSaturatedFat(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Trans Fat:</Text>
              <TextInput
                style={styles.input}
                placeholder="Trans Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={transFat}
                onChangeText={text => setTransFat(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Polyunsaturated Fat:</Text>
              <TextInput
                style={styles.input}
                placeholder="Polyunsaturated Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={polyunsaturatedFat}
                onChangeText={text => setPolyunsaturatedFat(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Monounsaturated Fat:</Text> 
              <TextInput
                style={styles.input}
                placeholder="Monounsaturated Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={monounsaturatedFat}
                onChangeText={text => setMonounsaturatedFat(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Cholesterol:</Text>
              <TextInput
                style={styles.input}
                placeholder="Cholesterol (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={cholesterol}
                onChangeText={text => setCholesterol(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Sodium:</Text>
              <TextInput
                style={styles.input}
                placeholder="Sodium (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={sodium}
                onChangeText={text => setSodium(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Potassium:</Text>
              <TextInput
                style={styles.input}
                placeholder="Potassium (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={potassium}
                onChangeText={text => setPotassium(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Calcium:</Text>
              <TextInput
                style={styles.input}
                placeholder="Calcium (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={calcium}
                onChangeText={text => setCalcium(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Iron:</Text>
              <TextInput
                style={styles.input}
                placeholder="Iron (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={iron}
                onChangeText={text => setIron(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Vitamin A:</Text>  
              <TextInput
                style={styles.input}
                placeholder="Vitamin A (mcg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={vitaminA}
                onChangeText={text => setVitaminA(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Vitamin C:</Text>
              <TextInput
                style={styles.input}
                placeholder="Vitamin C (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={vitaminC}
                onChangeText={text => setVitaminC(text)}
                onFocus={handleClosePicker}
              />
              <Text style={styles.label}>Vitamin D:</Text>  
              <TextInput
                style={styles.input}
                placeholder="Vitamin D (mcg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={vitaminD}
                onChangeText={text => setVitaminD(text)}
                onFocus={handleClosePicker}
              />

              <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
              onPress={handleSave} disabled={isLoading}>
                <Text style={styles.buttonText}>Save Food Item</Text>
              </TouchableOpacity>

              <View style={styles.extraSpace}></View>
              <View style={styles.extraSpace}></View>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
        <View style={styles.bottomSafe}></View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const dynamicStyles = (colorScheme, insets, width, height) => StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  topSafe: {
    paddingTop: insets.top,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
  },
  innerHeader: {
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
  label: {
    fontSize: height * .016,
    fontFamily: 'VarelaRound-Regular',
    fontWeight: 'bold',
    paddingBottom: height * .014,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  topEmpty: {
    paddingTop: height * .01,
  },
  input: {
    borderWidth: .5,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    fontFamily: 'Quicksand-Bold',
    height: height * .0425,
    padding: height * .0085,
    paddingHorizontal: height * .011,
    marginBottom: height * .008,
    borderRadius: 4,
    marginTop: height * -.011,
    fontSize: height * .015,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -1,
    marginBottom: height * .011,
  },
  halfInput: {
    flex: 1,
    marginRight: height * .007,
    marginBottom: height * .008,
    fontSize: height * .015,
  },
  restartLabel: {
    fontSize: height * .016,
    fontFamily: 'VarelaRound-Regular',
    fontWeight: 'bold',
    marginTop: height * -.012,
    paddingBottom: height * .012,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  restartInput: {
    borderWidth: .5,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    fontFamily: 'Quicksand-Bold',
    height: height * .0425,
    padding: height * .0085,
    paddingHorizontal: height * .011,
    marginBottom: height * .008,
    borderRadius: 4,
    marginTop: height * -.01,
    fontSize: height * .015,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
    height: height * .0435,
    borderWidth: .5,
    borderColor: colorScheme === 'dark' ? 'white' : 'black',
    borderRadius: 4,
    paddingHorizontal: height * .011,
    bottom: height * .01,
    justifyContent: 'space-between',
  },
  unitText: {
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .016,
    fontFamily: 'Quicksand-Bold',
  },
  dropdownArrow: {
    marginLeft:  height * .011,
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: height * .015,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    marginHorizontal: width * .285,
    top: height * .25,
    alignSelf: 'center',
    zIndex: 10,
  },
  dropdown: {
    width: '111%',
  },
  dropdownStyle: {
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#e0dede',
    borderWidth: .5,
    borderColor: colorScheme === 'dark' ? 'white' : 'black',
    borderRadius: 4,
  },
  dropdownLabel: {
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontFamily: 'Quicksand-Bold',
  },
  button: {
    backgroundColor: '#7323eb',
    padding: height * .011,
    marginTop: height * .011,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#fff',
    fontSize:  height * .0175,
  },
  extraSpace: {
    height: 10, 
    height: height * .011,
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
});

export default UpdateFoodScreen;
