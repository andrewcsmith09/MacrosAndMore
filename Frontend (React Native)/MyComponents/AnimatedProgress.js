import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import CircularProgress from './CircularProgress'; 

const AnimatedProgress = ({ 
  toValue, 
  duration, 
  radius, 
  strokeWidth, 
  thresholdGreen, 
  thresholdRed, 
  resetKey,
  fontSize,
  remainFont,
  trackColor,
  defaultColor,
  goal = 100,
  remaining = 100,
  unit,
  remainColor,
  overflowColor
}) => {
  const [percentage, setPercentage] = useState(0);
  const [displayValue, setDisplayValue] = useState(remaining); 
  const animatedValue = new Animated.Value(0);
  const textValue = new Animated.Value(remaining);

  // Function to animate progress circle
  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: toValue,
      duration: duration,
      useNativeDriver: false,
    }).start();

    animatedValue.addListener(({ value }) => {
      setPercentage(Math.round(value));
    });

    // Animate text value from remaining down to 0
    textValue.setValue(goal);
    Animated.timing(textValue, {
      toValue: remaining, 
      duration: duration,
      useNativeDriver: false,
    }).start();

    textValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    return () => {
      animatedValue.removeAllListeners();
      textValue.removeAllListeners();
    };
  }, [toValue, duration, remaining, resetKey]);

  return (
    <View style={styles.container}>
      <CircularProgress
        percentage={percentage}
        radius={radius}
        strokeWidth={strokeWidth}
        thresholdGreen={thresholdGreen}
        thresholdRed={thresholdRed}
        fontSize={fontSize}
        remainFont={remainFont}
        trackColor={trackColor}
        defaultColor={defaultColor}
        goal={goal}
        remaining={displayValue}
        unit={unit}
        remainColor={remainColor}
        overflowColor={overflowColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedProgress;
