import {shallow} from "enzyme";
import React from "react";
import {ScrollView} from "react-native";
import sinon from "sinon";
import {PullToRefreshProps} from "../PullToRefreshProps";
import {PullToRefreshView} from "../PullToRefreshView.ios";

describe("PullToRefreshView ios spec", () => {
  it("App show PullToRefreshView ios", () => {
    const stub = sinon.stub();
    const props: PullToRefreshProps = {
      isRefreshing: false,
      onRefresh: stub,
      contentComponent: <ScrollView />,
      pullAnimHeight: 70,
      pullAnimYValues: {from: -50, to: 10},
    };
    const wrapper = shallow(<PullToRefreshView {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
