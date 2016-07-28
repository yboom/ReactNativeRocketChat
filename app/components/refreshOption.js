import React from 'react-native';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Navigator
} from 'react-native';

import refresh from '../images/fa-refresh-icon/fa-refresh-icon.png';

export default React.createClass({
  // Configuration
  displayName: 'Refresh Options',
	
  
  // Component Render
  render() {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={()=>{require('react-native').NativeAppEventEmitter.emit('refreshRoom','');}}
        >
        <Image
          source={refresh}
          style={styles.refresh}
          />
      </TouchableOpacity>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    marginLeft: 8
  },
  refresh: {
    tintColor: 'rgba(0, 0, 0, 0.65)',
    marginTop:10,
    marginRight:2
  }
});
