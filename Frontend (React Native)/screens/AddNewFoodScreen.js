import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Modal, KeyboardAvoidingView, 
 Platform, useColorScheme, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axiosInstance from '../../Config/axios_config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';

/**
 * AddNewFoodScreen
 *
 * Allows users to create and submit a custom food item by entering nutritional details.
 * Supports unit conversion (g/oz), serving size input, and detailed nutrition breakdown.
 * Posts the new food item to the backend and navigates back on success. This screen 
 * can be visited through the Log Food Screen.
 */

const AddNewFoodScreen = ({ route, navigation }) => {
  const { user, foodName } = route.params;
  const [brand, setBrand] = useState('');
  const [name, setName] = useState(foodName || '');
  const [calories, setCalories] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [protein, setProtein] = useState('');
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
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'g', value: 'g'},
    {label: 'oz', value: 'oz'}
  ]);

  const [isLoading, setIsLoading] = useState(false);
  
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets(); 
  const colorScheme = useColorScheme(); 
  const styles = dynamicStyles(colorScheme, insets, width, height);
  
  // Function to save new custom food item to database
  const handleSave = () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); // Disable the button by setting loading to true

    // Check if required fields are filled
    if (!name || !calories || !servingSize) {
      Alert.alert('Invalid Food Item', 'Food Name, Calories & Serving Size fields must all be filled out.');
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    }

    let updatedServingSize; 

    // Determine serving size based on selected unit
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
      originalServingSize: servingSize || 0,
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

    // Send POST request to add new food item
    axiosInstance
      .post('/api/food/add', newFoodItem)
      .then(response => {
        Alert.alert('Food item added', 'Search for the new item to add it.');
        navigation.goBack(); // Navigate back to the previous screen
      })
      .catch(error => {
        console.error('Error adding new food item:', error);
        setIsLoading(false);  // Re-enable the button if validation fails
        Alert.alert('Error', 'Failed to add new food item. Please try again later.');
      });
  };

  // Function to cancel creation process and navigate to previous screen
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
    
  // Function to close serving unit picker
  handleClosePicker = () => {
    setOpen(false);
  };

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

            <Text style={styles.title}>Create Food Item</Text>
          </View>

          <KeyboardAwareScrollView
            style={styles.scrollContainer}
            keyboardOpeningTime={0}
            extraScrollHeight={102}
            showsVerticalScrollIndicator={false}
            enableResetScrollToCoords={false}
            keyboardShouldPersistTaps="handled" 
            contentInset={{ bottom: -10 }}
          >
            <View style={styles.content}>
              <View style={styles.topEmpty}></View>

              <TextInput
                style={styles.input}
                placeholder="Brand Name"
                value={brand}
                onChangeText={text => setBrand(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="*Food's Name"
                value={name}
                onChangeText={text => setName(text)}
                onFocus={handleClosePicker}
              />

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

              {/* Picker and modal for selecting serving unit */}
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

              <TextInput
                style={styles.restartInput}
                placeholder="Serving Description (ex. 1 slice or cup)"
                returnKeyType="done"
                value={servingText}
                onChangeText={text => setServingText(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="*Calories (kcal)"
                keyboardType="numeric"
                returnKeyType="done"
                value={calories}
                onChangeText={text => setCalories(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Protein (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={protein}
                onChangeText={text => setProtein(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Carbohydrates (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={carbs}
                onChangeText={text => setCarbs(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Fiber (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={fiber}
                onChangeText={text => setFiber(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Total Sugars (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={totalSugars}
                onChangeText={text => setTotalSugars(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
              style={styles.input}
              placeholder="Added Sugars (g)"
              keyboardType="numeric"
              returnKeyType="done"
              value={addedSugars}
              onChangeText={text => setAddedSugars(text)}
              onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Total Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={fat}
                onChangeText={text => setFat(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Saturated Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={saturatedFat}
                onChangeText={text => setSaturatedFat(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Trans Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={transFat}
                onChangeText={text => setTransFat(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Polyunsaturated Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={polyunsaturatedFat}
                onChangeText={text => setPolyunsaturatedFat(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Monounsaturated Fat (g)"
                keyboardType="numeric"
                returnKeyType="done"
                value={monounsaturatedFat}
                onChangeText={text => setMonounsaturatedFat(text)}
                onFocus={handleClosePicker}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Cholesterol (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={cholesterol}
                onChangeText={text => setCholesterol(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Sodium (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={sodium}
                onChangeText={text => setSodium(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Potassium (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={potassium}
                onChangeText={text => setPotassium(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Calcium (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={calcium}
                onChangeText={text => setCalcium(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Iron (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={iron}
                onChangeText={text => setIron(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Vitamin A (mcg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={vitaminA}
                onChangeText={text => setVitaminA(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Vitamin C (mg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={vitaminC}
                onChangeText={text => setVitaminC(text)}
                onFocus={handleClosePicker}
              />

              <TextInput
                style={styles.input}
                placeholder="Vitamin D (mcg)"
                keyboardType="numeric"
                returnKeyType="done"
                value={vitaminD}
                onChangeText={text => setVitaminD(text)}
                onFocus={handleClosePicker}
              />
                
              {/* Save food item button, protected against button spamming */}
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
    backgroundColor: colorScheme === 'dark' ? '#141414' : '#f7f7f7',
    paddingBottom: height * .03215,
    borderBottomColor: colorScheme === 'dark' ?  '#e0dede' : '#919090',
    borderBottomWidth: 2,
  },
  content: {
    flex: 1,
    padding: 15,
    paddingTop: 20,
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
    marginBottom: height * .025,
    borderRadius: 4,
    marginTop: height * -.011,
    fontSize: height * .015,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: height * .011,
  },
  halfInput: {
    flex: 1,
    marginRight: height * .007,
    marginBottom: 0,
    fontSize: height * .015,
  },
  restartInput: {
    borderWidth: .5,
    borderColor: colorScheme === 'dark' ? 'white' : '#706f6f',
    fontFamily: 'Quicksand-Bold',
    height: height * .0425,
    padding: height * .0085,
    paddingHorizontal: height * .011,
    marginBottom: height * .025,
    borderRadius: 4,
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
    height: height * .0425,
    borderWidth: .5,
    borderColor: colorScheme === 'dark' ? 'white' : 'black',
    borderRadius: 4,
    paddingHorizontal: height * .011,
    marginBottom: 0,
    bottom: height * .0054,
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
    padding:  height * .011,
    marginTop: height * -.005,
    marginBottom: height * .03,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#fff',
    fontSize:  height * .0175,
  },
  extraSpace: {
    height: height * .011,
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#eeedf0',
  },
});

export default AddNewFoodScreen;

