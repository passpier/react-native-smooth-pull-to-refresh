import React from "react";
import {Animated, UIManager, ViewStyle} from "react-native";

export interface PullAnimationProps {
  styleProps?: ViewStyle;
  yValues: {from?: number; to?: number};
  isRefreshing: boolean;
  minPullDistance: number;
  scrollY: Animated.Value;
}

type BaseComponentProps = PullAnimationProps;

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export const PullAnimation: React.FunctionComponent<BaseComponentProps> = ({styleProps, isRefreshing, scrollY, minPullDistance, yValues, children}) => (
  <Animated.View
    style={[
      styleProps,
      {
        top: scrollY.interpolate({
          inputRange: [-minPullDistance, 0],
          outputRange: [yValues.to || yValues.to === 0 ? yValues.to : yValues.from, yValues.from],
          extrapolate: "clamp",
        }),
        position: "absolute",
      },
    ]}
  >
    {React.Children.map(children, (child) => {
      return React.cloneElement(child as any, {
        isRefreshing,
        scrollY,
        minPullDistance,
      });
    })}
  </Animated.View>
);
