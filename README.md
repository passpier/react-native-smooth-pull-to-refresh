# react-native-smooth-pull-to-refresh
[![Build Status](https://travis-ci.org/passpier/react-native-smooth-pull-to-refresh.svg?branch=master)](https://travis-ci.org/passpier/react-native-smooth-pull-to-refresh) [![npm version](https://badge.fury.io/js/react-native-smooth-pull-to-refresh.svg)](https://badge.fury.io/js/react-native-smooth-pull-to-refresh) [![codecov](https://codecov.io/gh/passpier/react-native-smooth-pull-to-refresh/branch/master/graph/badge.svg)](https://codecov.io/gh/passpier/react-native-smooth-pull-to-refresh) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![style: styled-components](https://img.shields.io/badge/style-%F0%9F%92%85%20styled--components-orange.svg?colorB=daa357&colorA=db748e)](https://github.com/styled-components/styled-components)

Using [recompse](https://github.com/acdlite/recompose/blob/master/docs/API.md) to implement a pull to refresh component for React Native. The solution just using pure Js to support iOS and Android.

## Installation
Install the package
```
$ npm install --save react-native-smooth-pull-to-refresh
# or
$ yarn add react-native-smooth-pull-to-refresh
```

## Demo project
https://github.com/passpier/PTRDemo

## Basic usage
```typescript
import {PullToRefreshView} from "react-native-smooth-pull-to-refresh";

export class App extends Component<AppProps, AppState> {

  public state: AppState = {
    title: "Pull down to refresh",
    isRefreshing: false,
  };

  public render() {
    return (
      <View style={styles.container}>
        <View style={{height: 64, backgroundColor: "#24bdd8"}}>
          <Text style={{top: 35, fontWeight: "bold", fontSize: 18, color: "white", textAlign: "center"}}>Header</Text>
        </View>
        <PullToRefreshView
          minPullDistance={70}
          pullAnimHeight={70}
          pullAnimYValues={{from: -50, to: 10}}
          isRefreshing={this.state.isRefreshing}
          onRefresh={this.onInnerRefresh}
          onTriggerToRefresh={this.onTriggerToRefresh}
          contentComponent={
            <ScrollView>
              <Text style={styles.block1}>BLOCK 1</Text>
              <Text style={styles.block2}>BLOCK 2</Text>
              <Text style={styles.block3}>BLOCK 3</Text>
            </ScrollView>
          }
        >
          <RefreshView title={this.state.title}/>
        </PullToRefreshView>
      </View>
    );
  }

  @autobind
  private onInnerRefresh() {
    this.setState({title: "Loading..."});
    this.startRefreshing();
  }

  @autobind
  private onTriggerToRefresh(triggered: boolean) {
    this.setState({title: triggered ? "Release to refresh" : "Pull down to refresh"});
  }

  private startRefreshing() {
    this.setState({
      isRefreshing: true,
    });
    setTimeout(() => {
      this.setState({isRefreshing: false});
    }, 1500);
  }
```

## Props matrix



| Props | Type | Description |
| -------- | -------- | -------- |
| isRefreshing | boolean | Refresh state set by parent to trigger refresh |
| minPullDistance | number | Sets pull distance for how far the Y axis needs to be pulled before a refresh event is triggered |
| pullAnimHeightefresh | number | Sets header height for pull animation |
| pullAnimYValues | {from: number, to: number} | Points for where the animation components will start and end at on the Y-axis |
| onRefresh | function | Callback for when the refreshing state occurs |
| contentComponent | JSX.element | The content view which should be passed in as a scrollable type |
