import React, {
  StyleSheet,
  View,
  Text,
  ScrollView,
  PixelRatio,
  TouchableHighlight,
  Image,
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
  // Initial Value (State and Props)
  getInitialState() {
    return {
      lists: [],
      user: {},
      subs:{}
    }
  },
	//NativeDeviceEventEmitter.emit('name',value);
  // Component Lifecycle
  getRoomList(){
  	if(ListsDB.connectionError())
  	{
  		AsyncStorage.getItem('subscription',(error,result)=>{
  			this.setState({subs: JSON.parse(result)});
  			AsyncStorage.getItem('room',(error,result)=>{this.setState({lists: JSON.parse(result)});});
  		});
  		
  	}
  	else
  	{
    	ListsDB.subscribeToLists()
      	.then(() => {
        	ListsDB.observeLists((results) => {
        	console.log('lists');
          		if(results.length > 0) this.setState({lists: results});
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
  	this.reconnection = NativeAppEventEmitter.addListener('reconnection',(body)=>{
  		if(this.connection) this.connection = false;
  		Accounts.signInWithToken();	
  	});
  	this.refreshRoom = NativeAppEventEmitter.addListener('refreshRoom', (body)=>{
  		console.log('room');
  		if(ListsDB.connectionError())
  	  	{
  	  	 TodosDB.ddpClose()
  	  	  .then(()=>{
  			TodosDB.ddpConnection()
      			.then(() => {
        	 		Accounts.signInWithToken()
        	 		 .then(() =>{
        	 		 	this.getRoomList();
        	 		 });
      			});
      		 });
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
	this.getRoomList();
	
    Accounts.userId.then((userId) => {
      if (userId) {
        this.setState({user: {_id: userId}});
      }
    });

    Accounts.emitter.on('loggedIn', (userId) => {
      if (userId) {
        this.setState({user: {_id: userId}});
      }
    });
	Accounts.userName.then((userName) => {
      if (userName) {
        this.setState({user: {_id: this.state.user._id,name:userName}});
      }
    });
    Accounts.emitter.on('loggedOut', () => {
      this.setState({user: {}});
    });
  },
  componentWillUnmount() {
    this.refreshRoom.remove();
    this.appState.remove();
    this.net_work.remove();
    this.reconnection.remove();
  },
  componentDidUpdate(){
  	if(!ListsDB.connectionError())
  	{
  		if(!this.state.lists || (this.state.lists&&this.state.lists.length==0))
  		{
  		Accounts.emitter.on('loggedIn', (userId) => {
      		if (userId) {
        		this.setState({user: {_id: userId}});
        		ListsDB.subscribeToLists()
      			.then(() => {
        			ListsDB.observeLists((results) => {
          			this.setState({lists: results});
        			});
      			})
      			.catch((err) => {
        			console.log('Error: ', err);
      			});
      		}
    	});
  		}
  	}
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
  renderText(list)
  {
  	var detail = ListsDB.Listdetail(list._id);
  	if(!detail)
    {
    	if(this.state.subs) detail = this.state.subs[list._id];
    }
  	if(list.t == 'd')
  	{
        var title = '@ ';
        if(detail && detail.name) title = title + detail.name
        if(detail&&detail.alert)
        {
        	return (
  			<Text style={styles.alertstyle}>{title}</Text>
  			);
        }
        return (
  			<Text>{title}</Text>
  		);
  	}
  	else
  	{
  		if(detail && detail.alert)
        {
        	return (
  			<Text style={styles.alertstyle}>{list.name}</Text>
  			);
        }
  		return (
  			<Text>{list.name}</Text>
  		);
  	}
  },
  rendermsgs(list,i)
  {
  	var detail = ListsDB.Listdetail(list._id);
  	if(!detail)
    {
    	if(this.state.subs) detail = this.state.subs[list._id];
    }
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
            <View style={styles.row}>
              
                {this.rendermsgs(list,i)}
              
			  {this.renderLock(list)}
              {this.renderText(list)}

              <Image
                source={chevronRight}
                style={styles.rightIcon}
                />
            </View>
          </TouchableHighlight>
          <View style={styles.border} />
        </View>
      )
    });
  },

  // Component Render
  render() {
  if(ListsDB.connectionError()&&!this.state.lists)
  {
  	require('react-native').Alert.alert('','Connection Server Failed!');
  	return null;
  }
    return (
      <ScrollView>
      	<ListItemAdd />
        {this.renderItems()}
      </ScrollView>
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
  border: {
    height: 1 / PixelRatio.get(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  alertstyle:{
  	fontWeight:'bold'
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
