import React, {
  StyleSheet,
  View,
  Text,
  Image,
  PixelRatio,
  TouchableHighlight,
  Dimensions,
} from 'react-native';
let {AsyncStorage} = React;

export default React.createClass({
  // Configuration
  displayName: 'Todo Item More',
  propTypes: {
    listId: React.PropTypes.string,
    user:React.PropTypes.object.isRequired,
    update:React.PropTypes.object.isRequired
  },

  // Component Render
  render() {
    return (
      <View>
      <TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0.25)'
        	onPress={() => {this.props.update.nextPage()}}
        	>
        <View style={styles.row}>
          <Text style={styles.text}>{'More……'}</Text>
        </View>
    	</TouchableHighlight>
        <View style={styles.border} />
      </View>
    );
  }
});

const styles = StyleSheet.create({
  row: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  text:{
  	textAlign:'center',
  	fontSize:17,
  	marginLeft:Dimensions.get('window').width / 2 - 35
  },
  border: {
    height: 1 / PixelRatio.get(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
});
