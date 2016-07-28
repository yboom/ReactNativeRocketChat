import React, {
  TouchableHighlight,
  StyleSheet,
  Text,
  WebView,
  View,
  PixelRatio,
} from 'react-native';
let {AsyncStorage} = React;//require('react-native');
let {NativeAppEventEmitter} = React;

import Accounts from '../../config/db/accounts';

var myClass = require("NativeModules").MyClass;
export default React.createClass({
  // Configuration
  displayName: 'Webview',
  propTypes: {
    url: React.PropTypes.string,
    html:React.PropTypes.string,
    imageURL:React.PropTypes.string,
    update:React.PropTypes.object.isRequired
  },
	reload:null,
  // Initial Value (State and Props)
  getInitialState() {
    return {
      user: {},
    };
  },

  // Component Lifecycle
  componentWillMount() {
  	if(this.props.url == 'file://')
  	{
  		this.reload = NativeAppEventEmitter.addListener('reloadWeb', (body)=>{this.reloadWeb(body);});
  	}
    /*AsyncStorage.getItem('userId')
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
  componentWillUnmount(){
  	if(this.reload) 
  	{
  		this.props.update.setClickId();
  		this.reload.remove();
  	}
  },
  renderImage() {
  	if(this.props.imageURL)
  	{
		return (<Image
        	source={{uri:imageURL}}
        	style={styles.image}
    	/>);
  	}
    	return null;
  },
  reloadWeb(value){
  	var html = this.props.update.processHTML(value);
  	if(html)
  	{
  		let htmlText = '<!DOCTYPE html><html><body>'+html+'</body></html>';
  		if(require('react-native').Platform.OS === 'ios')
  		{
  			myClass.reloadWebByHTML(htmlText);
  		}
  		else
  		{
  			//this.refs.WEBVIEW_REF.source = {html:'<!DOCTYPE html><html><body>'+html+'</body></html>',baseUrl:this.props.url};
  			//this.refs.WEBVIEW_REF.reload();
  			myClass.reloadWebByHTML(htmlText);
  			//this.refs.WEBVIEW_REF.reloadWebByHTML(htmlText);
  		}
  	}
  },
  // Component Render
  render() {
  //console.log(this.props.url);
  if(this.props.url != 'file://')
  {
  	if(require('react-native').Platform.OS === 'ios')
  	{
  		return (<WebView 
      		source={{uri:this.props.url}}
      		startInLoadingState={true}
      		scalesPageToFit = {true}
      		/>
    	);
  	}
  	else
  	{
    	return (<WebView 
      		source={{uri:this.props.url}}
      		startInLoadingState={true}
      		javaScriptEnabled={true}
      		domStorageEnabled={true}
      		scalesPageToFit = {false}
      		style={{height:700}}
      		/>
    	);
    }
    }
    else
    {
    	if(require('react-native').Platform.OS === 'ios')
  		{
    	return(<WebView 
    		ref='WEBVIEW_REF'
      		source={{html:this.props.html,baseUrl:this.props.url}}
      		startInLoadingState={true}
      		scalesPageToFit = {true}
        />);
        }
        else
        {
        	return(<WebView 
    			ref='WEBVIEW_REF'
      			source={{html:this.props.html,baseUrl:this.props.url}}
      			startInLoadingState={true}
      			javaScriptEnabled={true}
      			domStorageEnabled={true}
      			scalesPageToFit = {true}
        	/>);
        }
    }
  }
});

const styles = StyleSheet.create({
  row: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  border: {
    height: 1 / PixelRatio.get(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  leftIcon: {
    marginRight: 10,
    tintColor: 'rgba(0, 0, 0, 0.25)'
  },
  image: {
  	marginLeft:10,
  	marginTop:3,
    width: 300,
    height: 300
  },
  rightIconContainer: {
    position: 'absolute',
    right: 15
  },
  rightIcon: {
    tintColor: 'rgba(0, 0, 0, 0.25)'
  },
  textChecked: {
    textDecorationLine: 'line-through'
  },
});