import React, {
  TouchableHighlight,
  StyleSheet,
  Text,
  Image,
  View,
  WebView,
} from 'react-native';
let {AsyncStorage} = React;//require('react-native');;
let {Platform} = React;

import Accounts from '../../config/db/accounts';
import ImageAndroid from 'react-native-image-zoom'

export default React.createClass({
  // Configuration
  displayName: 'Imageview',
  propTypes: {
    url: React.PropTypes.string,
    navigator:React.PropTypes.object.isRequired,
    update:React.PropTypes.object.isRequired,
    user:React.PropTypes.object.isRequired
  },

  // Initial Value (State and Props)
  getInitialState() {
    return {
      user: {},
    };
  },

  // Component Lifecycle
  componentWillMount() {
  	/*this.props.onStartShouldSetResponder=()=>false;
  	this.onStartShouldSetResponder=()=>false;
    AsyncStorage.getItem('userId')
    	.then((userId)=>{
    	if(userId){
    		this.setState({user:{_id:userId}});
    	}
    	AsyncStorage.getItem('userName')
    		.then((userName)=>{
  			if(userName)
  			{
  				this.setState({user:{_id:this.state.user._id,name:userName}});
  			}
  			AsyncStorage.getItem('loginToken')
      			.then((token) => {
        		if (token) {
          			this.setState({user:{_id:this.state.user._id,name:this.state.user.name,token:token}});
        		}
        	});
  		});
    });//*/
  },
  // Component Render
  render() {
  //console.log(this.props.url);
  	if(Platform.OS === 'ios')
  	{
    	return (
     		<View>
      			<Image 
      				source={{uri:this.props.url+'?preview=1'}}
      			/>
      		</View>
    	);
  	}
  	else
  	{
  		let {Dimensions} = require('react-native');
  		var w = Dimensions.get('window').width;
  		var h = Dimensions.get('window').height;
  		return (
     		<View style={{width:w,height:h,backgroundColor:'rgb(255, 255, 255)'}}>
      			<ImageAndroid 
      				source={{uri:this.props.url+'?rc_token='+this.props.user.token+'&rc_uid='+this.props.user._id}}
      				style={{width:w,height:h}}
      			/>
      		</View>
    	);
  	}
  }
});
