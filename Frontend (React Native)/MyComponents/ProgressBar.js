import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, InteractionManager, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window'); 

const AnimatedProgressBar = ({ progress, label, color, consumed, goal, unit, colorScheme, resetKey, 
  font, barHeight, greenThreshold = 95, redThreshold = 106}) => {
const isFocused = useIsFocused();
const animatedWidth = useRef(new Animated.Value(0)).current;
const remaining = Math.max(goal - consumed); 
const percentage = (consumed/goal) * 100;
const styles = dynamicStyles(colorScheme, font, barHeight);

// Function to animate progress bar
useEffect(() => {
    if (isFocused || resetKey) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, isFocused, resetKey]);

  let textColor = colorScheme === 'dark' ? '#e6e8e6' : '#4a4a4a'; // Default color for remaining text
  if (percentage >= greenThreshold) {
    textColor = '#23eb41'; // Over green threshold
  } 
  if (percentage >= redThreshold) {
    textColor = 'red'; // Over red threshold
  }

  // Function to convert values to desired display format
  const formatNumber = (value) => {
    // Round the number to one decimal place
    const roundedValue = Math.round(value * 10) / 10;
  
    // Check if the rounded value is an integer
    if (Number.isInteger(roundedValue)) {
      return roundedValue.toString(); // Return as whole number
    } else {
      return roundedValue.toFixed(1); // Return with one decimal place
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}<Text style={styles.values}>   {formatNumber(consumed)}<Text style={styles.slash}> / </Text>{goal}{unit}</Text></Text>
        {remaining < 0 ? (<Text style={[styles.remaining, { color: textColor }]}>{(remaining*-1).toFixed()}{unit} Over  </Text>) :
          <Text style={[styles.remaining, { color: textColor }]}>{remaining.toFixed()}{unit} Left  </Text>}
      </View>
      <View style={styles.barContainer}>
      <Animated.View
          style={[styles.progressBar, {
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: color
          }]}
        />
      </View>
    </View>
  );
};

const dynamicStyles = (colorScheme, font, barHeight) => StyleSheet.create({
  container: {
    alignItems: 'flex-start', 
  },
  row: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%',
    marginBottom: 5,
  },
  label: {
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    fontSize: font,
    fontWeight: 'bold',
    position: 'relative',
    bottom: -2,
  },
  values: {
    fontFamily: 'Quicksand-Bold',
    color: '#888',
    fontSize: height * .014,
    fontWeight: 'bold',
    position: 'relative',
    bottom: -2,
  },
  slash: {
    ontFamily: 'Quicksand-Bold',
    color: '#888',
    fontSize: height * .014,
    fontWeight: 'bold',
    position: 'relative',
    bottom: -2,
  },
  remaining: {
    fontSize: font,
    fontFamily: 'Quicksand-Bold',
    color: colorScheme === 'dark' ? 'white' : 'black',
    position: 'relative',
    bottom: -2,
  },
  barContainer: {
    width: '100%',
    height: barHeight,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    color: colorScheme === 'dark' ? 'white' : 'black',
  },
});

export default AnimatedProgressBar;

