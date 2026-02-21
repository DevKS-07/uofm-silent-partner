import React, { useEffect, useRef, type PropsWithChildren } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

type Props = PropsWithChildren<{
  index: number;
  style?: StyleProp<ViewStyle>;
}>;

const AnimatedOption = ({ children, index, style }: Props) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedOption;
