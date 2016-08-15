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
import TodosDB from '../../config/db/todos';

var myClass = require("NativeModules").MyClass;
export default React.createClass({
  // Configuration
  displayName: 'Webview',
  propTypes: {
    url: React.PropTypes.string,
    html:React.PropTypes.string,
    imageURL:React.PropTypes.string,
    update:React.PropTypes.object.isRequired,
    urls:React.PropTypes.array.isRequired,
    user:React.PropTypes.object.isRequired
  },
	reload:null,
	html:'',
	subscribOne:null,
  // Initial Value (State and Props)
  getInitialState() {
    return {
      user: {},
      html:'',
    };
  },

  // Component Lifecycle
  componentWillMount() {
  	if(this.props.url == 'file://')
  	{
  		this.reload = NativeAppEventEmitter.addListener('reloadWeb', (body)=>{this.reloadWeb(body);});
  		this.subscribOne = NativeAppEventEmitter.addListener('subscribOneMessage', (result)=>{
  			if(result)
   			{
   				var html = this.props.update.processHTML(result,false);
   				if(html)
   				{
   					this.html = this.html.replace('<div id="'+result._id+'">['+result.id+']</div><br />'+'loading','['+result.id+']<br /><div style="margin-left:15px;font-size:17;">'+html+'</div>');
   				}
   				else
   				{
   					this.html = this.html.replace('<div id="'+result._id+'">['+result.id+']</div><br />'+'loading','['+result.id+']<br /><div style="margin-left:15px;font-size:17;">'+result.msg+'</div>');
   				}
   				if(this.html.indexOf('<table>') > -1 && this.html.indexOf('<head>') < 0)
				{
					head = "<!DOCTYPE html><html><head><style>table{margin: 0;padding: 0;font-size: 100%;vertical-align: baseline;border-spacing: 0;border-collapse: collapse;\
						border-top-color: #808080;box-sizing:border-box;border-left: 1px solid #aaa; border-top: 1px solid #aaa;}\
						tr{margin: 0;padding: 0;border: 0;background-color:rgba(160,160,160,0.2);font-size: 100%;vertical-align: baseline;display: table-row;vertical-align: inherit;border-top-color: inherit;border-right-color: inherit;border-bottom-color: inherit;border-left-color: inherit;}\
						td{border-right: 1px solid #aaa;border-bottom: 1px solid #aaa;padding: 2px 4px;margin: 0;font-size: 100%;vertical-align: baseline;display: table-cell;vertical-align: inherit;}\
						</style></head>";
					this.html = this.html.replace('<!DOCTYPE html><html>',head);
				}
				this.setState({html:this.html});
   			}
  		});
  		this.setState({html:this.props.html});
  		this.html = this.props.html;
  		if(this.props.urls.length > 0)
  		{
  			this.loadMessage(this.props.urls[0],0)
  		}
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
  loadMessage(url,index)
  {
	if(TodosDB.connectionError())
	{
		AsyncStorage.getItem('message'+url._id,(error,result)=>{
  			if(result)
  			{
  				json = JSON.parse(result);
  				var html = this.props.update.processHTML(json,false);
   				if(html)
   				{
   					this.html = this.html.replace('<div id="'+url._id+'">['+url.id+']</div><br />'+'loading','['+url.id+']<br /><div style="margin-left:15px;font-size:17;">'+html+'</div>');
   				}
   				else
   				{
   					this.html = this.html.replace('<div id="'+url._id+'">['+url.id+']</div><br />'+'loading','['+url.id+']<br /><div style="margin-left:15px;font-size:17;">'+json.msg+'</div>');
   				}
  			}
  			if(index+1 < this.props.urls.length)
   			{
   				this.loadMessage(this.props.urls[index+1],index+1)
   			}
   			else
   			{
   				this.setState({html:this.html});
   			}
  		});
	}
	else
	{
  		TodosDB.subscribeToOneTodos(url.name,[url._id])
   			.then(()=>{
   				TodosDB.observeOneTodos(url._id,(result)=>{
   					//console.log(result);
   					if(result)
   					{
   						AsyncStorage.setItem('message'+url._id,JSON.stringify(result));
   						var html = this.props.update.processHTML(result,false);
   						if(html)
   						{
   							this.html = this.html.replace('<div id="'+url._id+'">['+url.id+']</div><br />'+'loading','['+url.id+']<br /><div style="margin-left:15px;font-size:17;">'+html+'</div>');
   						}
   						else
   						{
   							this.html = this.html.replace('<div id="'+url._id+'">['+url.id+']</div><br />'+'loading','['+url.id+']<br /><div style="margin-left:15px;font-size:17;">'+result.msg+'</div>');
   						}
   					}
   					if(index+1 < this.props.urls.length)
   					{
   						this.loadMessage(this.props.urls[index+1],index+1)
   					}
   					else
   					{
   						this.setState({html:this.html});
   					}
   				});
   			})
   		 	.catch((err) => {
        		console.log(err);
      	});
      }
  },
  componentWillUnmount(){
  	if(this.reload) 
  	{
  		this.props.update.setClickId();
  		this.reload.remove();
  		this.subscribOne.remove();
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
  	var html = this.props.update.processHTML(value,false);
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
  			//myClass.reloadWebByHTML(htmlText);
  			//this.refs.WEBVIEW_REF.reloadWebByHTML(htmlText);
  			this.setState({html:htmlText});
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
    			ref='WEBVIEW_REF'
      			source={{uri:this.props.url}}
      			startInLoadingState={true}
      			javaScriptEnabled={true}
      			domStorageEnabled={true}
      			scalesPageToFit = {false}
      			/>);
    	}
    }
    else
    {
    	if(require('react-native').Platform.OS === 'ios')
  		{
    		return(<WebView 
    			ref='WEBVIEW_REF'
      			source={{html:this.state.html,baseUrl:this.props.url}}
      			startInLoadingState={true}
      			scalesPageToFit = {true}
        	/>);
        }
        else
        {
        	let agent = 'rc_token='+this.props.user.token+'; rc_uid='+this.props.user._id;
        	return(<WebView 
    			ref='WEBVIEW_REF'
      			source={{html:this.state.html,baseUrl:this.props.url}}
      			startInLoadingState={true}
      			javaScriptEnabled={true}
      			domStorageEnabled={true}
      			scalesPageToFit = {true}
      			userAgent={agent}
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