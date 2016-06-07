import React, {
  AppRegistry,
  Component
} from 'react-native';

import Main from './app/components/main';

let ReactNativeRocketChat = React.createClass({
  render() {
    return (
      <Main />
    );
  }
});

AppRegistry.registerComponent('ReactNativeRocketChat', () => ReactNativeRocketChat);
