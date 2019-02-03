import {shallow} from "enzyme";
import React from "react";
import {Animated} from "react-native";
import {PullAnimation, PullAnimationProps} from "../PullAnimation";

describe("PullAnimation spec", () => {
  it("App show PullAnimation", () => {
    const props: PullAnimationProps = {
      yValues: {from: -50, to: 10},
      isRefreshing: false,
      minPullDistance: 70,
      scrollY: new Animated.Value(0),
    };
    const wrapper = shallow(<PullAnimation {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
