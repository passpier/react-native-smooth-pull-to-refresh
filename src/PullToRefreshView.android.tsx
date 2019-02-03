import React, {ComponentClass} from "react";
import {Animated, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView} from "react-native";
import {compose, lifecycle, withHandlers, withState} from "recompose";
import styled from "styled-components/native";
import {PullAnimation} from "./PullAnimation";
import {defaultPTRBackgroundColor, pullAnimatedBackgroundColor, PullToRefreshProps} from "./PullToRefreshProps";

interface PullToRefreshViewState {
  scrollY: Animated.Value;
  setScrollY: (scrollY: Animated.Value) => void;
  shouldTriggerRefresh: boolean;
  setShouldTriggerRefresh: (shouldTriggerRefresh: boolean) => void;
  minHeight: number;
  setMinHeight: (minHeight: number) => void;
  refreshHeight: number;
  setRefreshHeight: (refreshHeight: number) => void;
  isScrollFree: boolean;
  setIsScrollFree: (isScrollFree: boolean) => void;
}

interface PullToRefreshViewHandler {
  refScrollComponent: (innerRef: ScrollView) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onScrollEvent: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  innerScrollTo: (y: number, animated?: boolean) => void;
}

type BaseComponentProps = PullToRefreshProps & PullToRefreshViewState & PullToRefreshViewHandler;

const BaseComponent: React.SFC<BaseComponentProps> = ({
  backgroundColor = pullAnimatedBackgroundColor,
  refScrollComponent,
  minHeight,
  refreshHeight,
  isScrollFree,
  onScrollEvent,
  onLayout,
  onMomentumScrollEnd,
  onScrollEndDrag,
  isRefreshing,
  scrollY,
  minPullDistance,
  pullAnimHeight,
  pullAnimYValues,
  children,
  contentComponent,
}) => (
  <ScrollContainer backgroundColor={backgroundColor}>
    <ScrollView ref={refScrollComponent} contentContainerStyle={{minHeight}} scrollEnabled={isScrollFree} onScroll={onScrollEvent} onLayout={onLayout} onMomentumScrollEnd={onMomentumScrollEnd} onScrollEndDrag={onScrollEndDrag}>
      <RefreshContainer backgroundColor={defaultPTRBackgroundColor} height={refreshHeight}>
        <PullAnimation
          yValues={pullAnimYValues}
          styleProps={{height: pullAnimHeight}}
          scrollY={
            scrollY.interpolate({
              inputRange: [0, minPullDistance],
              outputRange: [0, -minPullDistance],
            }) as any
          }
          isRefreshing={isRefreshing}
          minPullDistance={minPullDistance}
        >
          {children}
        </PullAnimation>
      </RefreshContainer>
      {React.cloneElement(contentComponent, {
        scrollEnabled: false,
      })}
    </ScrollView>
  </ScrollContainer>
);

export const PullToRefreshView: ComponentClass<PullToRefreshProps> = compose<BaseComponentProps, PullToRefreshProps>(
  withState("scrollY", "setScrollY", new Animated.Value(0)),
  withState("shouldTriggerRefresh", "setShouldTriggerRefresh", false),
  withState("minHeight", "setMinHeight", 0),
  withState("refreshHeight", "setRefreshHeight", 1),
  withState("isScrollFree", "setIsScrollFree", false),
  withHandlers<PullToRefreshProps & PullToRefreshViewState, PullToRefreshViewHandler>(() => {
    let scrollContentRef: ScrollView;
    return {
      refScrollComponent: () => (innerRef: ScrollView) => {
        scrollContentRef = innerRef;
      },
      onLayout: ({setMinHeight, refreshHeight}) => (event: LayoutChangeEvent) => {
        layoutScrollHeight = event.nativeEvent.layout.height;
        setMinHeight(layoutScrollHeight + refreshHeight);
      },
      onScrollEvent: ({onScroll, minPullDistance, refreshHeight, setMinHeight, setRefreshHeight, scrollY, shouldTriggerRefresh, onTriggerToRefresh, setShouldTriggerRefresh}) => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (refreshHeight === 1 && event.nativeEvent.velocity.y < 0) {
          const minHeight = layoutScrollHeight + minPullDistance;
          setMinHeight(minHeight);
          setRefreshHeight(minPullDistance);
        }
        onScroll && onScroll(event);
        scrollY.setValue(minPullDistance - event.nativeEvent.contentOffset.y);
        const distance = (scrollY as any)._value;
        if (distance > 5) {
          if (distance === minPullDistance) {
            if (!shouldTriggerRefresh) {
              onTriggerToRefresh && onTriggerToRefresh(true);
              setShouldTriggerRefresh(true);
            }
          } else if (shouldTriggerRefresh) {
            onTriggerToRefresh && onTriggerToRefresh(false);
            setShouldTriggerRefresh(false);
          }
        }
      },
      onMomentumScrollEnd: ({isRefreshing, scrollY, refreshHeight}) => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!isRefreshing && (scrollY as any)._value >= 0) {
          scrollContentRef.scrollTo({y: refreshHeight});
        }
      },
      onScrollEndDrag: ({isRefreshing, scrollY, minPullDistance, shouldTriggerRefresh, refreshHeight, onRefresh}) => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isRefreshing) {
          return;
        }
        const distance = (scrollY as any)._value;
        if (distance >= minPullDistance) {
          if (!isRefreshing && shouldTriggerRefresh) {
            onRefresh();
          }
        } else if (distance >= 0) {
          scrollContentRef.scrollTo({y: refreshHeight});
        }
      },
      innerScrollTo: () => (y: number, animated: boolean = true) => {
        scrollContentRef.scrollTo({y, animated});
      },
    };
  }),
  lifecycle<BaseComponentProps, {}>({
    componentDidMount() {
      setTimeout(() => this.props.setIsScrollFree(true), 100);
    },
    componentDidUpdate(prevProps: BaseComponentProps) {
      const {isRefreshing, minHeight, refreshHeight, scrollY, isReachEnd, innerScrollTo, toPosition} = this.props;
      if (prevProps.isRefreshing !== isRefreshing) {
        if (!isRefreshing && !isReachEnd) {
          if ((scrollY as any)._value >= 0) {
            innerScrollTo(refreshHeight);
          }
          scrollY.setValue(0);
        }
      }
      if (prevProps.minHeight !== minHeight) {
        setTimeout(() => innerScrollTo(refreshHeight, false));
      }
      if (prevProps.toPosition !== toPosition) {
        innerScrollTo((scrollY as any)._value + toPosition);
      }
    },
  }),
)(BaseComponent);

let layoutScrollHeight: number = 0;

const ScrollContainer = styled.View`
  flex: 1;
  background-color: ${(props: {backgroundColor: string}) => props.backgroundColor};
`;

interface RefreshContainerType {
  height: number;
  backgroundColor: string;
}

const RefreshContainer = styled.View`
  height: ${(props: RefreshContainerType) => props.height};
  background-color: ${(props: RefreshContainerType) => props.backgroundColor};
  overflow: visible;
`;
