import React, {
  StyleSheet,
  View,
  TextInput,
  Image,
  PixelRatio,
  Alert,
  TouchableHighlight,
} from 'react-native';
let {AsyncStorage} = React;
let {NativeAppEventEmitter} = React;

import addIcon from '../../images/fa-plus-circle/fa-plus-circle.png';
import uploadIcon from '../../images/fa-upload-icon/fa-upload-icon.png';

import TodosDB from '../../config/db/todos';
import Accounts from '../../config/db/accounts';

var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');
var fileUpload = require('NativeModules').FileUpload;

var options = {
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};
//var subscription = null;
export default React.createClass({
  // Configuration
  displayName: 'Todo Item Add',
  propTypes: {
    listId: React.PropTypes.string,
    user:React.PropTypes.object.isRequired
  },
	subscription:null,
  // Initial State
  getInitialState() {
    return {
      message: '',
      error:''
    }
  },
  componentWillMount() {
    //this.subscription = NativeAppEventEmitter.addListener('pasteBoard', (body)=>{this.setState({message:body.value});});
    this.subscription = NativeAppEventEmitter.addListener('copymsg', (body)=>{this.setState({message:body});});
  },
  componentWillUnmount() {
    this.subscription.remove();
  },
  saveInfo(rid,todo)
  {
    	let todoObj = {rid: rid,msg: todo,u:{_id:this.props.user._id,username:this.props.user.name}}
        	AsyncStorage.getItem('messageSAE'+this.props.listId,(error,result)=>{
  				if(result)
  				{
  					var message = JSON.parse(result);
  					var errors = [];
  					if(message.error && message.error.length > 0) errors = message.error;
  					if(message.info && message.info.length > 0)
  					{
  						var todos = message.info;
  						todos.push(todoObj);
  						var results = {'info':todos,'error':errors};
  						AsyncStorage.setItem('messageSAE'+this.props.listId,JSON.stringify(results));
  					}
  					else
  					{
  						var infos = [];
  						infos.push(todoObj);
  						var results = {'info':infos,'error':errors};
  						AsyncStorage.setItem('messageSAE'+this.props.listId,JSON.stringify(results));
  					}
  				}
  				else
  				{
  					var infos = [];
  					infos.push(todoObj);
  					var results = {'info':infos};
  					AsyncStorage.setItem('messageSAE'+this.props.listId,JSON.stringify(results));
  				}
  				Alert.alert('',this.state.error+'. Message save to Sending');
  				this.setState({message: ''});
      			this.refs.input.clear();
  		});
    },
  // Event Handlers
  handleSubmit() {
  	//Alert.alert('',this.state.user._id+'133'+this.state.user.name);
  	if(Object.keys(Accounts.userId).length <= 0)
  	{
  		Alert.alert('','Please login');
  		return;
  	}
  	if(!this.state.message.length)
  	{
  		Alert.alert('','Input information');
  		return;
  	}
    if (this.state.message.length) {
    	if(TodosDB.connectionError())
    	{
    		TodosDB.ddpConnection()
      		.then(() => {
        	 	Accounts.signInWithToken()
        	 	.then(() => {
        	 		let u = {_id:this.props.user._id,username:this.props.user.name};
      				TodosDB.addTodo(this.state.message, this.props.listId,u);
      				this.setState({message: ''});
      				this.refs.input.clear();
        	 	})
        	 	.catch((err) => {
        	 		console.log('send message loginToken:'+err);
        	 		this.setState({error:err});
        	 		this.saveInfo(this.props.listId,this.state.message);
        	 	})
      		})
      		.catch((err) => {
      			//Alert.alert('',err);
        		console.log('send message connection:'+err);
        		this.setState({error:err});
        		this.saveInfo(this.props.listId,this.state.message);
      		})
    	}
      else
      {
      	let u = {_id:this.props.user._id,username:this.props.user.name};
      	TodosDB.addTodo(this.state.message, this.props.listId,u);
      	this.setState({message: ''});
      	this.refs.input.clear();
      }
    }
  },
  showPicker()
  {
  	ImagePicker.showImagePicker(options, (response) => {
  		//console.log('Response = ', response);
  		if (response.didCancel) {
    		console.log('User cancelled image picker');
 		}
  		else if (response.error) {
    		console.log('ImagePicker Error: ', response.error);
  		}
  		else if (response.customButton) {
    		console.log('User tapped custom button: ', response.customButton);
  		}
  		else {
    		// You can display the image using either data...
    		if(!reponse.data)
    		{
    			Alert.alert('','File encode error or selected video file!');
    			return;
    		}
    		if(Platform.OS === 'ios')
    		{
    			let size = response.fileSize;
    			let name = response.uri.split('/').pop();
    			let type = 'image/'+name.split('.').pop();
    			response.size = size;
    			response.type = type;
    			response.name = name;
    		}
    		TodosDB.uploadFile(response,this.props.listId,this.props.user);
    		
    		response.data = '';
    		console.log('Response = ', response);
    		//const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

    		// or a reference to the platform specific asset location
    		/*if (Platform.OS === 'ios') {
      			const source = {uri: response.uri.replace('file://', ''), isStatic: true};
    		} else {
      			const source = {uri: response.uri, isStatic: true};
    		}//*/
    		//console.log(source);
  		}
	});
  },
  // Component Render
  render() {
  	let sytlesInput=[];
  	sytlesInput.push(styles.input);
  	if(require('react-native').Platform.OS === 'ios')
  	{
  		sytlesInput.push(styles.inputIOS);
  	}
  	else
  	{
  		sytlesInput.push(styles.inputAndroid);
  	}
    return (
      <View>
        <View style={styles.row}>
        <TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => {this.showPicker()}}
        	>
          <Image
            source={uploadIcon}
            style={styles.icon}
            />
        </TouchableHighlight>
          <TextInput
            ref='input'
            style={sytlesInput}
            placeholder="Send new message"
            onSubmitEditing={this.handleSubmit}
            multiline={true}
            returnKeyType='send'
            blurOnSubmit={true}
            value = {this.state.message}
            onChangeText={(message) => this.setState({message: message})}
            />
        </View>
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
  input: {
    flex: 1,
    fontSize:15
  },
  inputIOS:{
  	height: 30
  },
  inputAndroid:{
  	height: 37
  },
  icon: {
    marginRight: 10,
    tintColor: 'rgba(0, 0, 0, 0.25)'
  },
  uploadicon: {
    marginRight: 100,
    tintColor: 'rgba(0, 0, 0, 0.25)'
  },
  border: {
    height: 1 / PixelRatio.get(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
});
