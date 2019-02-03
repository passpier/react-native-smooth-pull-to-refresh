import "jest";

import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import mockComponent from "react-native/jest/mockComponent";

Enzyme.configure({adapter: new Adapter()});

jest.mock("Animated", () => {
  return {
    Value: () => ({
      interpolate: () => null,
    }),
    View: mockComponent("View"),
  };
});
