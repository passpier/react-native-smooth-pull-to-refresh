import React, {ComponentClass} from "react";
import {Animated, NativeScrollEvent, NativeSyntheticEvent, ScrollView} from "react-native";
import {compose, lifecycle, withHandlers, withState} from "recompose";
import styled from "styled-components/native";
import {PullAnimation} from "./PullAnimation";
import {defaultMinPullDistance, defaultPTRBackgroundColor, pullAnimatedBackgroundColor, PullToRefreshProps} from "./PullToRefreshProps";

interface PullToRefreshViewState {
  shouldTriggerRefresh: boolean;
  setShouldTriggerRefresh: (shouldTriggerRefresh: boolean) => void;
  scrollY: Animated.Value;
  setScrollY: (scrollY: Animated.Value) => void;
  isScrollFree: boolean;
  setIsScrollFree: (isScrollFree: boolean) => void;
}

interface PullToRefreshViewHandler {
  refScrollComponent: (innerRef: ScrollView) => void;
  onResponderRelease: () => void;
  onScrollEvent: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  innerScrollTo: (y: number) => void;
}

type BaseComponentProps = PullToRefreshProps & PullToRefreshViewState & PullToRefreshViewHandler;

const BaseComponent: React.SFC<BaseComponentProps> = ({
  backgroundColor = defaultPTRBackgroundColor,
  scrollY,
  isRefreshing,
  minPullDistance = defaultMinPullDistance,
  contentComponent,
  onResponderRelease,
  isScrollFree,
  onScrollEvent,
  refScrollComponent,
  pullAnimHeight,
  pullAnimYValues,
  children,
}) => (
  <ScrollContainer backgroundColor={backgroundColor}>
    <PullAnimationContainer
      style={{
        backgroundColor: pullAnimatedBackgroundColor,
        height: scrollY.interpolate({
          inputRange: [-minPullDistance, 0],
          outputRange: [minPullDistance, 0],
        }),
      }}
    >
      <PullAnimation yValues={pullAnimYValues} styleProps={{height: pullAnimHeight}} scrollY={scrollY} isRefreshing={isRefreshing} minPullDistance={minPullDistance}>
        {children}
      </PullAnimation>
    </PullAnimationContainer>
    <ScrollContentView>
      {React.cloneElement(contentComponent, {
        scrollEnabled: isScrollFree,
        scrollEventThrottle: 16,
        onScroll: onScrollEvent,
        onResponderRelease,
        ref: refScrollComponent,
        scrollToOverflowEnabled: true,
      })}
    </ScrollContentView>
  </ScrollContainer>
);

export const PullToRefreshView: ComponentClass<PullToRefreshProps> = compose<BaseComponentProps, PullToRefreshProps>(
  withState("shouldTriggerRefresh", "setShouldTriggerRefresh", false),
  withState("scrollY", "setScrollY", new Animated.Value(0)),
  withState("isScrollFree", "setIsScrollFree", true),
  withHandlers<PullToRefreshProps & PullToRefreshViewState, PullToRefreshViewHandler>(() => {
    let scrollContentRef: ScrollView;
    return {
      refScrollComponent: () => (innerRef: ScrollView) => {
        scrollContentRef = innerRef;
      },
      onResponderRelease: ({isRefreshing, shouldTriggerRefresh, minPullDistance, setIsScrollFree, onRefresh}) => () => {
        if (!isRefreshing && shouldTriggerRefresh) {
          scrollContentRef.scrollTo({y: -minPullDistance});
          setIsScrollFree(false);
          onRefresh();
        }
      },
      onScrollEvent: ({isScrollFree, onScroll, scrollY, minPullDistance, onTriggerToRefresh, shouldTriggerRefresh, setShouldTriggerRefresh}) => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScroll && onScroll(event);
        scrollY.setValue(event.nativeEvent.contentOffset.y);
        if (!isScrollFree) {
          return;
        }
        if (event.nativeEvent.contentOffset.y <= -minPullDistance) {
          onTriggerToRefresh && onTriggerToRefresh(true);
          setShouldTriggerRefresh(true);
        } else if (shouldTriggerRefresh) {
          onTriggerToRefresh && onTriggerToRefresh(false);
          setShouldTriggerRefresh(false);
        }
      },
      innerScrollTo: () => (y: number) => {
        scrollContentRef.scrollTo({y});
      },
    };
  }),
  lifecycle<BaseComponentProps, {}>({
    componentDidUpdate(prevProps: BaseComponentProps) {
      const {isRefreshing, innerScrollTo, setIsScrollFree, isReachEnd = false, toPosition, scrollY} = this.props;
      if (prevProps.isRefreshing !== isRefreshing) {
        if (!isRefreshing) {
          if (!isReachEnd) {
            innerScrollTo(0);
          }
          setIsScrollFree(true);
        }
      }
      if (prevProps.toPosition !== toPosition) {
        innerScrollTo((scrollY as any)._value + toPosition);
      }
    },
  }),
)(BaseComponent);

const ScrollContainer = styled.View`
  flex: 1;
  z-index: -100;
  background-color: ${(props: {backgroundColor: string}) => props.backgroundColor};
`;

const PullAnimationContainer = styled(Animated.View)``;

const ScrollContentView = styled.View`
  background-color: transparent;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;
