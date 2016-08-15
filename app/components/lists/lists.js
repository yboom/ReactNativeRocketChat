import React, {
  StyleSheet,
  View,
  Text,
  ScrollView,
  PixelRatio,
  TouchableHighlight,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
let {AsyncStorage} = React;//require('react-native');
let {NativeAppEventEmitter} = React;

import Todos from '../todos/todos';
import ListItemAdd from './listItemAdd';
import ListOptions from './listOptions';

import ListsDB from '../../config/db/lists';
import Accounts from '../../config/db/accounts';

import chevronRight from '../../images/fa-chevron-right/fa-chevron-right.png';
import lock from '../../images/fa-lock-icon/lock.png';
import searchIcon from '../../images/fa-search-icon/fa-search-icon.png';

import SendTodos from '../todos/sendtodos';
import TodosDB from '../../config/db/todos';
import NativeDeviceEventEmitter from 'RCTDeviceEventEmitter';


export default React.createClass({
  // Configuration
  displayName: 'Lists',
  appState : null,
  refreshRoom : null,
  net_work:null,
  connection:false,
  reconnection:null,
  currentList:[],
  searchStatue:false,
  beginEdit:false,
  // Initial Value (State and Props)
  getInitialState() {
    return {
      lists: [],
      user: {},
      subs:{},
      key:''
    }
  },
	//NativeDeviceEventEmitter.emit('name',value);
  // Component Lifecycle
  getRoomList(){
  	if(ListsDB.connectionError())
  	{
  		AsyncStorage.getItem('subscription',(error,result)=>{
  			this.setState({subs: JSON.parse(result)});
  			AsyncStorage.getItem('room',(error,result)=>{
  				this.setState({lists: JSON.parse(result)});
  				this.currentList=JSON.parse(result);
  			});
  		});
  		
  	}
  	else
  	{
  		console.log('getRoomList');
    	ListsDB.subscribeToLists()
      	.then(() => {
        	ListsDB.observeLists((results) => {
        	//console.log('lists');
        	//console.log(results);
          		if(results.length > 0) 
          		{ 
          			this.setState({lists: results});
          			this.currentList = results;
          		}
        	});
      	})
      	.catch((err) => {
        	console.log('Error: ', err);
      	});
    }
  },
  connectServer()
  {
	  this.connection = true;
  	  if(ListsDB.connectionError())
  	  {
  			TodosDB.ddpConnection()
      			.then(() => {
        	 		Accounts.signInWithToken();
      		});
       }
  },
  componentWillMount() {
  	this.reconnection = NativeAppEventEmitter.addListener('wasReconnect',(body)=>{
  		if(this.connection) this.connection = false;
  		Accounts.ReSignInWithToken();	
  	});
  	this.refreshRoom = NativeAppEventEmitter.addListener('refreshRoom', (body)=>{
  		console.log('room');
  		if(ListsDB.connectionError())
  	  	{
  	  	 TodosDB.ddpClose()
  	  	  .then(()=>{
  			TodosDB.ddpConnection()
      			.then(() => {
        	 		Accounts.signInWithToken();
      			});
      		 });
       	}
       	else
       	{
       		this.getRoomList();
       	}
  	});
  	this.appState = NativeDeviceEventEmitter.addListener('appStateDidChange',(body)=>{
  		//console.log(body.app_state);
  		if(!this.connection && body.app_state == 'active')
  		{
  			this.connectServer();
  		}
  		if(body.app_state == 'background')
  		{
  			this.conection = false;
  		}
  	});
  	this.net_work = NativeDeviceEventEmitter.addListener('networkStatusDidChange',(body)=>{
  		//console.log(body.network_info);
  		if(!this.connection &&(body.network_info != 'none' || body.network_info != 'NONE' || body.network_info != 'unknown' || body.network_info != 'UNKNOWN'))
  		{
  			this.connectServer();
  		}
  		if(body.network_info == 'none' || body.network_info == 'NONE' || body.network_info == 'unknown' || body.network_info == 'UNKNOWN')
  		{
  			this.conection = false;
  		}
  	});

    Accounts.userId.then((userId) => {
      if (userId) {
        this.setState({user: {_id: userId}});
        this.getRoomList();
      }
    });

    Accounts.emitter.on('loggedIn', (userId) => {
      if (userId) {
      console.log('logedId');
        this.setState({user: {_id: userId}});
        let userName = Accounts.name();
        if(userName)
        {
        	this.setState({user: {_id: this.state.user._id,name:userName}});
        }
        this.getRoomList();
      }
    });
	Accounts.userName.then((userName) => {
      if (userName) {
        this.setState({user: {_id: this.state.user._id,name:userName}});
      }
    });
    
    Accounts.emitter.on('loggedOut', () => {
      ListsDB.unsubscribeLists()
      this.setState({user: {}});
      this.setState({lists:[]});
    });
  },
  componentWillUnmount() {
    this.refreshRoom.remove();
    this.appState.remove();
    this.net_work.remove();
    this.reconnection.remove();
  },
  // Event Handlers
  sendMessage(list,result)
  {
  	let message = JSON.parse(result);
  	if(message.info && message.info.length > 0)
  	{
  		let todos = message.info;
  		let stodos = todos;
  		let errors = [];
  		if(message.error && message.error.length > 0) errors = message.error;
  		var index = 0;
  		function sm()
  		{
  			//console.log('sm');
  			if(index >= todos.length)
  			{
  				//console.log('finish');
      			require('react-native').Alert.alert('','Send finish.');
      			var results = {'info':[],'error':errors};
  				AsyncStorage.setItem('messageSAE'+list._id,JSON.stringify(results));
  				SendTodos.updateRow(errors);
  			}
  			else
  			{
  				var todo = todos[index];
  				TodosDB.addTodos(todo.msg, todo.rid,todo.u);
  				index++;
  				sm();
  			}
  		}
  		sm();
  	}
  },
  _handleMessage(list)
  {
  	
  },
  handlePressInfo(list,path)
  {
  	let nav = this.props.navigator;

    if (!nav) return;

    let rightButton = null;
    let self = this;
    nav.push({
      component: SendTodos,
      title: 'Sending',
      leftButton: {
        title: "Back",
        handler: () => nav.pop()
      },
      rightButton: {
      	title:" ",
      	handler:()=> self._handleMessage(list)
      },
      passProps: {
        listId:list._id,
        path:path,
        navigator:nav
      }
    });
  },
  buttonTitle(info,error)
  {
  	title = 'Sending';
  	if(info > 0 && error == 0)
  	{
  		return (
  		<Text>
  			{title+'('+info+')'}
  		</Text>
  		);
  	}
  	else if(info == 0 && error > 0)
  	{
  		return (
  		<Text>
  			{title+'('}
  			<Text style={{color:'red'}}>
  				{error}
  			</Text>
  			{')'}
  		</Text>
  		);
  	}
  	else if(info > 0 && error > 0)
  	{
  		return (
  		<Text>
  			{title+'('+info+'+'}
  			<Text style={{color:'red'}}>
  			{error}
  			</Text>
  			{')'}
  		</Text>
  		);
  	}
  	else
  	{
  		return title;
  	}
  },
  handlePress(list) {
    let nav = this.props.navigator;
    let {user} = this.state;

    if (!nav) return;

    let rightButton = null;
    let title = list.name;
    let path = '';
    var detail = ListsDB.Listdetail(list._id);
    if(!detail)
    {
    	if(this.state.subs) detail = this.state.subs[list._id];
    }
	if(list.t == 'd')
  	{
  		title = '@ ';
  		path = '/direct/';
  		if(detail && detail.name) 
  		{
  			title = title+detail.name;
  			path = path+detail.name;
  		}
  	}
  	else if(list.t == 'p')
  	{
  		path = '/group/'+list.name;
  	}
  	else
  	{
  		path = '/channel/'+list.name;
  	}
  	let self = this;
  	AsyncStorage.getItem('messageSAE'+list._id,(error,result)=>{
  		var info = 0;
  		var err = 0;
  		if(result){
  			let message = JSON.parse(result);
  			if(message.info && message.info.length > 0)
  			{
  				//info = message.info.length;
  			}
  			if(message.error && message.error.length > 0)
  			{
  				err = message.error.length;
  			}
  		}
  		let buttonTitle = 'Sending';
  		if(err > 0) buttonTitle += '('+err+')';
  		
  		nav.push({
      		component: Todos,
      		title: title,
      	leftButton: {
        	title: "Back",
        	handler: () => nav.pop()
      	},
      	rightButton: {
      		title: buttonTitle,
      		handler: () => self.handlePressInfo(list,path)
      	},
      	passProps: {
        	listId: list._id,
        	path:path,
        	navigator:nav
      	}
    	});
  	});
    
    if(detail && (detail.alert || detail.unread)) ListsDB.readMessages(list._id,this.state.user._id);
  },
  
  renderLock(list) {
    if (list.t == 'p') 
    {
      let icon = lock;
      return (
          <Image
            source={icon}
            style={styles.lockIcon}
            />
      );
    }
    return null;
  },
  renderText(list,detail)
  {
  	/*var detail = ListsDB.Listdetail(list._id);
  	if(!detail)
    {
    	if(this.state.subs) detail = this.state.subs[list._id];
    }//*/
  	if(list.t == 'd')
  	{
        var title = '@ ';
        if(detail && detail.name) title = title + detail.name
        if(detail&&detail.alert)
        {
        	if(this.searchStatue)
        	{
        		let local = title.indexOf(this.state.key);
        		let begin = title.substr(0,local);
        		let end = title.substr(local+this.state.key.length);
        		return (
  					<Text style={styles.alertstyle}>
  					{begin}
  					<Text style={{color:'red',fontWeight:'bold'}}>
  						{this.state.key}
  					</Text>
  					{end}
  					</Text>);
        	}
        	else
        	{
        		return (<Text style={styles.alertstyle}>{title}</Text>);
  			}
        }
        if(this.searchStatue)
        {
        	let local = title.indexOf(this.state.key);
        	let begin = title.substr(0,local);
        	let end = title.substr(local+this.state.key.length);
        	return (
  				<Text>
  				{begin}
  				<Text style={{color:'red',fontWeight:'bold'}}>
  					{this.state.key}
  				</Text>
  				{end}
  				</Text>);
        }
        else
        {
        	return (<Text>{title}</Text>);
  		}
  	}
  	else
  	{
  		if(this.searchStatue)
        {
        	let title = list.name
        	let local = title.indexOf(this.state.key);
        	let begin = title.substr(0,local);
        	let end = title.substr(local+this.state.key.length);
        	if(detail && detail.alert)
        	{
        		return (
  					<Text style={styles.alertstyle}>
  						{begin}
  					<Text style={{color:'red',fontWeight:'bold'}}>
  						{this.state.key}
  					</Text>
  						{end}
  					</Text>
  				);
  			}
  			else
  			{
  				return (
  					<Text>
  						{begin}
  					<Text style={{color:'red',fontWeight:'bold'}}>
  						{this.state.key}
  					</Text>
  						{end}
  					</Text>
  				);
  			}
        }
        else
        {
  			if(detail && detail.alert)
        	{
        		return (<Text style={styles.alertstyle}>{list.name}</Text>);
        	}
  			return (<Text>{list.name}</Text>);
  		}
  	}
  },
  rendermsgs(list,i,detail)
  {
    if(i == this.state.lists.length - 1)
  	{
  		//console.log('save subscription');
  		ListsDB.SaveListdetail();
  	}
  	if(detail && detail.unread > 0)
  	{
  		return (
  		<View style={styles.incomplete}>
  		<Text style={styles.incompleteText}>
  			{detail.unread}
  		</Text>
  		</View>);
  	}
  	return null;
  },
  _rowItem(list,i)
  {
  	var detail = ListsDB.Listdetail(list._id);
  	if(!detail)
    {
    	if(this.state.subs) detail = this.state.subs[list._id];
    }
    let textStyle = [];
    textStyle.push(styles.row);
    if(detail && detail.f) textStyle.push(styles.favorite);
  	return (<View style={textStyle}>
              
      {this.rendermsgs(list,i,detail)}
              
      {this.renderLock(list)}
      {this.renderText(list,detail)}

      <Image
      	source={chevronRight}
      	style={styles.rightIcon}/>
	</View>)
  },
  // Sub-render
  renderItems() {
  //<Text style={styles.incompleteText}>{list.msgs}</Text>
  	if(!this.state.lists) return null;
    return this.state.lists.map((list, i) => {
      return (
        <View key={list._id}>
          <TouchableHighlight
            underlayColor='rgba(0, 0, 0, 0.1)'
            onPress={() => this.handlePress(list)}
            >
            {this._rowItem(list,i)}
          </TouchableHighlight>
          <View style={styles.border} />
        </View>
      )
    });
  },
  handleSubmit() {
    if (this.state.key.length) 
    {
    	let results = [];
    	if(ListsDB.connectionError())
    	{
    		for(var i=0;i<this.currentList.length;i++)
   			{
   				let list = this.currentList[i];
   				let value = this.state.subs[list._id];
   				if(value)
   				{
   					if(value.name.indexOf(this.state.key) > -1)
   					{
   						results.push(list);
   					}
   				}
   			}
    	}
    	else
    	{
      		let result = ListsDB.findList(this.state.key);
      		if(result)
      		{
      			for(var i=0;i<this.currentList.length;i++)
   				{
   					let list = this.currentList[i];
   					for(var j=0;j<result.length;j++)
   					{
   						let value = result[j];
   						if(value.rid == list._id)
   						{
   							results.push(list);
   							break;
   						}
   					}
   				}
   			}
        }
        this.searchStatue = true;
        this.setState({lists:results});
    }
    else
  	{
  		this.searchStatue = false;
  		this.beginEdit = false;
  		this.setState({lists:this.currentList});
  	}
  },
  // Component Render
  render() {
  	if(ListsDB.connectionError()&&!this.state.lists)
  	{
  		require('react-native').Alert.alert('','Connection Server Failed!');
  		return null;
  	}
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
  	//console.log(Dimensions.get('window'));
    return (
    <View style={{height:Dimensions.get('window').height-64}}>
     <View>
     	<View style={styles.search}>
     	<Image
            source={searchIcon}
            style={styles.searchIcon}
            />
          <TextInput
            ref='input'
            style={sytlesInput}
            placeholder="Search"
            returnKeyType='search'
            onSubmitEditing={this.handleSubmit}
            onFocus={()=>{if(!this.beginEdit){this.beginEdit=true;this.setState({lists:[]})}}}
            onChangeText={(key) => {this.setState({key:key.replace(/(^\s*) | (\s*$)/g,'')});this.searchStatue = false;}}
            />
        </View>
        <View style={styles.border} />
     </View>
      <ScrollView >
      	<ListItemAdd />
        {this.renderItems()}
      </ScrollView>
    </View>
    );
  }
});

const styles = StyleSheet.create({
  row: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  search: {
    padding: 15,
    flexDirection: 'row',
    flex: 1,
  },
  input: {
    flex: 1,
  },
  inputIOS: {
    height: 20
  },
  inputAndroid:{
  	height: 37
  },
  searchIcon: {
    marginRight: 10,
    tintColor: 'rgba(0, 0, 0, 0.35)'
  },
  border: {
    height: 1 / PixelRatio.get(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  alertstyle:{
  	fontWeight:'bold'
  },
  favorite:{
  	backgroundColor:'rgb(255, 255, 224)'
  },
  rightIcon: { 
    position: 'absolute',
    right: 15,
    tintColor: 'rgba(0, 0, 0, 0.25)'
  },
  incompleteText: {
    color: '#ffffff',
  },
  lockIcon: {
    position: 'absolute',
    right: 40
  },
  incomplete: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
