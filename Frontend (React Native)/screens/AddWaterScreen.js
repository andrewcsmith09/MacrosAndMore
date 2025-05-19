import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, useColorScheme, 
 TouchableOpacity, Dimensions, Image, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axiosInstance from '../../Config/axios_config';

/**
 * AddWaterScreen
 *
 * Allows users to log their water intake for a specific date.
 * Users can add new water logs, update existing ones, or delete logs.
 * It supports adding water in specific quantities (in ounces), with validation for whole numbers.
 * Users can toggle between add and edit modes, and view their current water log for the selected date.
 * The screen fetches existing water logs from the backend and updates the water log when changes are made.
 */

const { width, height } = Dimensions.get('window'); 

const AddWaterScreen = ({ route, navigation }) => {
  const { user, selectedDate } = route.params;
  const [logData, setLogData] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [updateQuantity, setUpdateQuantity] = useState(logData ? logData.water : 0);
  const [selectedMeal, setSelectedMeal] = useState('Water');
  const [selectedUnit, setSelectedUnit] = useState('oz');

  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets(); 
  const styles = dynamicStyles(colorScheme, insets);
  const inputRef = useRef(null);

  // Function to convert date to YYYY-MM-DD format
  const getDate = (date) => {
    const now = date ? new Date(date) : new Date(); // Use provided date or today's date
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; 
  };

  // Pass selected date to getDate function
  const date = getDate(selectedDate);

  // Function to fetch water logs for selected date
  const fetchWaterLogs = () => {
    const data = {
      userId: user.id,
      date: date,
    }
    // Send get request to retrieve water logs
    axiosInstance.get(`/api/foodlog/user/${user.id}/logs/water`, { params: data })
      .then(response => {
        if (response.data && response.data.length > 0) {
          setLogData(response.data[0]); // Set the first log entry if available
        } else {
          setLogData(null); // Set to null if no logs are returned
        }
      })
      .catch(error => {
        console.error('Error fetching water data:', error);
        setLogData(null); // Set to null in case of error
      });
  };

  // Fetches water logs when screen is focused
  useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        fetchWaterLogs();
      });
      return unsubscribe;
  }, [navigation]);

  // Function to create or update water log
  const handleLogWater = () => {
    if (isLoading) return;  // Prevent multiple presses while loading
    setIsLoading(true); // Disable the button by setting loading to true

    // Validate quantity input
    if (addQuantity % 1 !== 0 || addQuantity === '') {
      Alert.alert('Invalid Input', 'Amount must be a valid whole number.')
      setIsLoading(false);  // Re-enable the button if validation fails
      return;
    };

    // Create new log if none exists
    if (!logData || !logData.id) {
      const logData = {
        logDate: date,
        quantity: 0,
        userId: user.id,
        selectedMeal: selectedMeal,
        selectedUnit: selectedUnit,
        logTime: getCurrentTime(),
        water: addQuantity
      };

      // Send post request to create new water log
      axiosInstance.post('/api/foodlog/log', logData)
        .then(response => {
          Alert.alert('Water Logged', 'Water has been added to Food Log.');
          navigation.goBack();
        })
        .catch(error => {
          console.error('Error Adding Water:', error);
          setIsLoading(false); 
          Alert.alert('Error', 'Failed to add water. Please try again later.');
        });
    } 
    // If log exists, increase quantity
    else {        
      const logQuantity = (Number(addQuantity) || 0) + (Number(logData?.water) || 0);
      const log = logQuantity; 
      // Send request to increase quantity for existing water log
      axiosInstance.put(`/api/foodlog/${logData.id}/water`, log, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          Alert.alert('Water Logged', 'Water has been added to Food Log.');
          navigation.goBack();
        })
        .catch(error => {
          console.error('Error Adding Water:', error);
          setIsLoading(false);  // Re-enable the button if validation fails
          Alert.alert('Error', 'Failed to add water. Please try again later.');
        });
    }
  };    

  // Function to update water log with a new quantity (increase or decrease)
  handleUpdateWater = () => {
    if (isLoading) return;  
    setIsLoading(true);

    // Validate quantity input
    if (updateQuantity % 1 !== 0 || updateQuantity === '') {
      Alert.alert('Invalid Input', 'Amount must be a valid whole number.')
      setIsLoading(false); 
      return;
    };

    const log = updateQuantity; 

    // If log already exists
    if (logData) {
      // If update quantity is 0, delete log
      if (updateQuantity.trim() === '0') {
        axiosInstance.delete(`/api/foodlog/${logData.id}`)
          .then(response => {
            Alert.alert('Water Log Deleted', 'Water has been removed from Food Log.');
            navigation.goBack();
        })
      } else {
        // Otherwise send update request with new quantity
        axiosInstance.put(`/api/foodlog/${logData.id}/water`, log, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          Alert.alert('Water Logged', 'Water total has been updated.');
          navigation.goBack();
        })
        .catch(error => {
          console.error('Error Adding Water:', error);
          setIsLoading(false);  
          Alert.alert('Error', 'Failed to add water. Please try again later.');
        });
      }
    } else {
      // If no log exists, create one
      const log = {
        logDate: date,
        quantity: 0,
        userId: user.id,
        selectedMeal: selectedMeal,
        selectedUnit: selectedUnit,
        logTime: getCurrentTime(),
        water: updateQuantity
      };
      // Send post request to create log using given quantity
      axiosInstance.post('/api/foodlog/log', log)
        .then(response => {
            Alert.alert('Water Logged', 'Water total has been updated.');
            navigation.goBack();
        })
        .catch(error => {
            console.error('Error Adding Water:', error);
            setIsLoading(false);  // Re-enable the button if validation fails
            Alert.alert('Error', 'Failed to add water. Please try again later.');
      });
    }
  };

  // Function to delete existing water log
  handleDeleteLog = () => {
    Alert.alert(
      'Delete Water Log?',
      "Are you sure you want to delete your water log? This will remove all water from today's food log. " + 
      'You can always log more water at any time.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            // Send request to delete water log
            axiosInstance.delete(`/api/foodlog/${logData.id}`)
              .then(response => {
                Alert.alert('Water Log Deleted', 'Water has been removed from Food Log.');
                navigation.goBack();
              })
              .catch(error => {
                  console.error('Error Deleting Log:', error);
                  Alert.alert('Error', 'Failed to delete log. Please try again later.');
              });
          },
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  // Function to discard changes and navigate to previous screen
  const handleCancel = () => {
    Alert.alert(
      'Leave Screen?',
      'Are you sure you want to cancel? This will discard all changes.',
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

  // Function to toggle add mode
  const handleAddWater = () => {
    setIsEditing(false);
    setIsAdding(true); 
    setUpdateQuantity(logData ? logData.water : 0 );
  };
  
  // Function to toggle edit mode
  const handleEditWater = () => {
    setIsEditing(true);
    setIsAdding(false); 
    setUpdateQuantity(logData ? logData.water : 0 );
  };
  
  // Function to add one to current quantity
  const handleAddOne = () => {
    const currentQuantity = Number(addQuantity) || 0; 
    setAddQuantity((currentQuantity + 1).toString());
  }
      
  // Function to add eight to current quantity
  const handleAddEight = () => {
    const currentQuantity = Number(addQuantity) || 0; 
    setAddQuantity((currentQuantity + 8).toString()); 
  }

  // Function to add sixteen to current quantity
  const handleAddSixteen = () => {
    const currentQuantity = Number(addQuantity) || 0; 
    setAddQuantity((currentQuantity + 16).toString());
  }

  // Function to retrieve current time in HH:MM format
  const getCurrentTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
  };

  // Function to convert date to calender format
  const formatDateToStandard = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `${monthNames[month - 1]} ${day}, ${year}`;
  };

  // Function to set focus to quantity input
  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Function to manually dismiss keyboard
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss(); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSafe}></View>
      <View style={styles.innerHeader}>
        <TouchableOpacity style={styles.mealButton} onPress={handleCancel}>
          <Text style={styles.backButton}>{'< Back    '}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log Water</Text>
      </View>
        <View style={styles.innerContainer}>
          <Text style={styles.totalLabel}>Water Log For {formatDateToStandard(date)}</Text>

          <TouchableOpacity style={styles.waterDrop} onPress={handleFocus}>
            <Text style={styles.totalValue}>
              {isEditing ? (
                // In update mode, show the update quantity
                `${updateQuantity} oz.`
              ) : (
                // In add mode, show the sum of logData.water and addQuantity
                `${(Number(logData?.water) || 0) + (Number(addQuantity) || 0)} oz.`
              )}
            </Text>
            <Image
              source={require('../assets/water3.png')}
              style={styles.image}
            />
          </TouchableOpacity>
            
          <View style={styles.inputRow}>
            {!isEditing ?
              <TextInput 
                  ref={inputRef}
                  style={styles.input}
                  value={addQuantity}
                  onChangeText={setAddQuantity}
                  keyboardType="numeric"
                  placeholder="Amount"  
                  returnKeyType='done'
              />
              :
              <TextInput 
                  ref={inputRef}
                  style={styles.input}
                  value={updateQuantity.toString()}
                  onChangeText={text => setUpdateQuantity(text)}
                  keyboardType="numeric"
                  placeholder="Amount"
                  returnKeyType='done'
              />
            }

            <Text style={styles.ozLabel}>Oz.</Text>
          </View>

          <View style={styles.emptySpace}/>

          {!isEditing ?
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.increaseButtons} onPress={handleAddOne}>
                <Text style={styles.increaseButtonText}>+1 oz.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.increaseButtons} onPress={handleAddEight}>
                <Text style={styles.increaseButtonText}>+8 oz.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.increaseButtons} onPress={handleAddSixteen}>
                <Text style={styles.increaseButtonText}>+16 oz.</Text>
              </TouchableOpacity>
            </View>
          : 
            <View style={styles.emptySpace2}/> }

          {!isEditing ?
          <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
          onPress={handleLogWater} disabled={isLoading}>
            <Text style={styles.buttonText}>Add Water</Text>
          </TouchableOpacity>
          :
          <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.5 }]} 
          onPress={handleUpdateWater} disabled={isLoading}>
            <Text style={styles.buttonText}>Update Water Total</Text>
          </TouchableOpacity>
          }
          
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEditWater}>
              <Text style={styles.editText}>Manually Edit Water Total</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={handleAddWater}>
              <Text style={styles.editText}>Add Water To Log</Text>
            </TouchableOpacity>
          )}

          {logData ?
            <TouchableOpacity style={styles.deleteButton} onPress={() => {handleDeleteLog(); handleKeyboardDismiss();}}>
              <Text style={styles.deleteText}>Remove From Today's Log</Text>
            </TouchableOpacity>
          : null }
        </View>
      <View style={styles.bottomSafe}></View>
    </View>
  );
};

const dynamicStyles = (colorScheme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colorScheme === 'dark' ? '#1c1b1b' : '#fff',
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
  },
  image: {
    height: height * .17,
    marginTop: height * .01,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  heading: {
    alignItems: 'center',
  },
  totalLabel: {
    color: colorScheme === 'dark' ? 'white' : 'black',
    alignSelf: 'center',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .018,
    paddingTop: height * .02,
  },
  totalValue: {
    color: 'white',
    position: 'absolute',
    alignSelf: 'center',
    fontFamily: 'Quicksand-Bold',
    fontSize: height * .02,
    top: height  * .1,
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: height * .015,
  },
  input: {
      borderWidth: 1,
      borderColor: '#ccc',
      height: height * .04,
      width: width * .3,
      marginRight: width * .013,
      borderRadius: 4,
      textAlign: 'center',
      alignSelf: 'center',
      fontSize: height * .017,
      fontFamily: 'Quicksand-Bold',
      color: colorScheme === 'dark' ? 'white' : 'black',
  },
  ozLabel: {
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    marginRight: width * -.065,
    marginTop: height * .023,
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: height * .05,
    paddingBottom: height * .05,
  },
  emptySpace: {
      paddingTop: height * .022,
  },
  emptySpace2: {
    paddingTop: height * .01,
},
  increaseButtons: {
    backgroundColor: '#119bf7',
    padding: height * .011,
    borderRadius: 5,
    width: width * .2,
    alignItems: 'center',
  },
  increaseButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#fff',
    fontSize: height * .017,
  },
  button: {
      backgroundColor: '#7323eb',
      padding: height * .011,
      borderRadius: 5,
      alignItems: 'center',
  },
  buttonText: {
      fontFamily: 'Quicksand-Bold',
      color: '#fff',
      fontSize: height * .017,
  },
  editButton: {
    marginTop: height * .02,
    alignSelf: 'center',
  },
  editText: {
    color: '#8438f5',
    fontSize: height * .0165,
    fontFamily: 'Quicksand-Bold',
  },
  deleteButton: {
    position: 'absolute',
    bottom: height *.02,
    alignSelf: 'center',
  },
  deleteText: {
    color: 'red',
    fontSize: height * .0165,
    fontFamily: 'Quicksand-Bold',
  },
  bottomSafe: {
    paddingBottom: insets.bottom === 0 ? 0 : insets.bottom - height * .005,
    backgroundColor: colorScheme === 'dark' ? '#242426' : '#eeedf0',
  },
});

export default AddWaterScreen;
