import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';

const CircularProgress = ({
  percentage,
  radius = 50,
  strokeWidth = 10,
  thresholdGreen = 75,
  thresholdRed = 100,
  fontSize,
  remainFont,
  trackColor,
  defaultColor = '#6a5acd',
  remaining, 
  goal,
  unit,
  remainColor,
  overflowColor
}) => {
  const circumference = 2 * Math.PI * radius;

  // Calculate the progress circle offset
  const progressPercentage = Math.min(percentage, thresholdRed);
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Determine the largest multiple of 100 less than or equal to the red threshold
  const largestMultipleOf100ForRedThreshold = Math.floor(thresholdRed / 100) * 100;

  // Calculate the red threshold at which the circle should be fully red
  const fullRedThreshold = largestMultipleOf100ForRedThreshold + 100;

  // Determine if the circle should be fully red
  const isFullyRed = percentage >= fullRedThreshold;

  // Calculate overflow circle offset
  const overflowPercentage = isFullyRed ? Math.max(percentage - fullRedThreshold, 0) : Math.max(percentage - Math.floor(percentage / 100) * 100, 0);
  const overflowDashoffset = circumference - (overflowPercentage / 100) * circumference;

  // Determine the colors based on thresholds
  const isGreen = percentage >= thresholdGreen && percentage < thresholdRed;
  const isRed = percentage >= thresholdRed;
  const progressColor = isFullyRed ? defaultColor : (isGreen ? '#23eb41' : defaultColor)
  const textColor = isRed ? 'red' : (isGreen ? '#23eb41' : defaultColor);

  // Special case: if percentage is over 100 and meets green threshold, make the circle fully green
  const specialGreenCase = !isFullyRed && percentage < thresholdRed && percentage >= thresholdGreen && percentage >= 100;

  const diameter = radius * 2;
  const svgSize = diameter + strokeWidth + .8;

  return (
    <View style={styles.container}>
      <Svg height={svgSize} width={svgSize}>


        {/* Background Track Circle when under red threshold */}
        {percentage < thresholdRed && (
          <Circle
            stroke={trackColor}
            fill="none"
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
        )}

        {/* Background Track Circle when above red threshold */}
        {percentage >= thresholdRed && (
          <Circle
            stroke={progressColor}
            fill="none"
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
        )}
  

        {/* Progress Circle (up to red threshold or fully green in special case) */}
        {percentage < thresholdRed && (
          <Circle
            stroke={specialGreenCase ? '#23eb41' : progressColor}
            fill="none"
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={specialGreenCase ? 0 : strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
          />
        )}

        {/* Overflow Circle (only visible if percentage exceeds fullRedThreshold) */}
        {isFullyRed && (
          <Circle
            stroke={overflowColor}
            fill="none"
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0} // Full circle for overflow
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
          />
        )}

        {/* Overflow Circle (only visible if percentage exceeds red threshold and not in special green case) */}
        {!isFullyRed && percentage >= thresholdRed && !specialGreenCase && (
          <Circle
            stroke={overflowColor}
            fill="none"
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={overflowDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
          />
        )}

        {/* Text Display */}
        {remaining < 0 ? (
        <SvgText
          x={radius + strokeWidth / 2}
          y={radius + strokeWidth * -.25}
          fill={textColor}
          fontSize={fontSize}
          fontFamily='VarelaRound-Regular'
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {`${(remaining*-1).toFixed()}${unit}`}
        </SvgText>) :
        <SvgText
        x={radius + strokeWidth / 2}
        y={radius + strokeWidth * -.25}
        fill={textColor}
        fontSize={fontSize}
        fontFamily='VarelaRound-Regular'
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {`${remaining.toFixed()}${unit}`}
      </SvgText>}

        {remaining < 0 ? (
        <SvgText
          x={radius + strokeWidth / 3}
          y={radius + strokeWidth / .75}
          fill={remainColor}
          fontSize={remainFont}
          fontFamily='VarelaRound-Regular'
          textAnchor='middle'
          alignmentBaseline="middle"
        > Over Goal</SvgText>) :
        <SvgText
          x={radius + strokeWidth / 3}
          y={radius + strokeWidth / .75}
          fill={remainColor}
          fontSize={remainFont}
          fontFamily='VarelaRound-Regular'
          textAnchor='middle'
          alignmentBaseline="middle"
        > Remaining</SvgText>}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgress;
