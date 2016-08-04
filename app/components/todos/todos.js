import React, {
  TouchableHighlight,
  ListView
} from 'react-native';
let {AsyncStorage} = React;//require('react-native');
let _ = require("underscore");

import TodoItem from './todoItem';
import TodoItemAdd from './todoItemAdd';

import TodosDB from '../../config/db/todos';

import SendTodos from '../todos/sendtodos';
import TodoItemMore from './todoItemMore';
//var count = 20;
//var sendNote = false;
var myClass = require("NativeModules").MyClass;
export default React.createClass({
  // Configuration
  displayName: 'Todos',
  propTypes: {
    listId: React.PropTypes.string,
    path:React.PropTypes.string,
    navigator:React.PropTypes.object.isRequired
  },
	
	count:20,
	reload:false,
	clickId:'',
	clickMsg:'',
	currentData:[],
	user:{},
	dataSource:[],
	deleteMessage:null,
	showLocal:false,
	sendMessage:null,
  // Initial Value (State and Props)
  getInitialState() {
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      todos: ds.cloneWithRows([]),
    };
  },

  // Component Lifecycle
  componentWillMount() {
  //console.log('Todos willmount');
  this.deleteMessage = require('react-native').NativeAppEventEmitter.addListener('deleteMessage',(body)=>{this._deleteMessage(body);});
  	AsyncStorage.getItem('userId')
    	.then((userId)=>{
    	if(userId){
    		this.user._id=userId;
    	}
    	AsyncStorage.getItem('userName')
    		.then((userName)=>{
  			if(userName)
  			{
  				this.user.name=userName;
  			}
  			AsyncStorage.getItem('loginToken')
      			.then((token) => {
        		if (token) {
          			this.user.token=token;
          			//console.log(this.user);
        		}
        	});
  		});
    });
    let listId = this.props.listId;
    if(TodosDB.connectionError())
  	{
  		AsyncStorage.getItem('message'+listId,(error,result)=>{
  			if(result){
  				this.showLocal = true;
  				this.sendMessage = require('react-native').NativeAppEventEmitter.addListener('sendMessage',(body)=>{this.updateListView(body);});
  				json = JSON.parse(result);
  				this.setState({todos: this.state.todos.cloneWithRows(json)});
  				this.dataSource=json;
  				this.currentData=json;
  			}
  		});
  	}
  	else
  	{
    	TodosDB.subscribeToTodos(listId)
      		.then(() => {
        		TodosDB.observeTodos(listId, (results) => {
        			//console.log('result-------------------');
        			//console.log(results);
        			if(results.length > 0)
        			{
        				if(require('react-native').Platform.OS === 'ios')
        				{
        					//myClass.saveSpotlight({name:this.props.path,data:results},(error,result)=>{});
        				}
        				AsyncStorage.setItem('message'+listId,JSON.stringify(results));
          				this.setState({todos: this.state.todos.cloneWithRows(results)});
          				this.dataSource=results;
          				this.currentData=results;
          			}
        		},this.count);
      		})
      		.catch((err) => {
        	console.log('Error: ', err);
      	});
    }
  },
  _deleteMessage(todo){
  	let result = TodosDB.removeMessage(todo);
  	//console.log('delete result= ' + result);
  	if(result)
  	{
  		var data = [];
  		for(var i=0;i<this.dataSource.length;i++)
  		{
  			let t = this.dataSource[i];
  			if(t._id != todo._id)
  			{
  				data.push(t);
  			}
  		}
  		this.dataSource = data;
  		this.setState({todos:this.state.todos.cloneWithRows(this.dataSource)});
  	}
  },
  updateListView(todo){
  	if(_.isArray(todo))
  	{
  		var data = todo.concat(this.dataSource);
        this.dataSource=data;
  	}
  	else
  	{
  		this.dataSource.unshift(todo);
  	}
  	this.setState({todos:this.state.todos.cloneWithRows(this.dataSource)});
  },
  componentWillUnmount() {
	this.deleteMessage.remove();
	if(this.sendMessage) this.sendMessage.remove();
  },
  currentClickId(_id,msg){
  	this.clickId=_id;
  	this.clickMsg=msg;
  	if(this.clickId.length > 0 && this.clickMsg.length > 0 && !this.reload) this.reload=true;
  },
  // Sub-render
  renderItem(todo) {
    if(this.clickId.length > 0 && this.clickMsg.length > 0 && (this.clickId == todo._id) && (this.clickMsg != todo.msg))
    {
    	if(this.reload)
    	{
    		this.clickId='';
    		this.clickMsg='';
    		this.reload=false;
    		require('react-native').NativeAppEventEmitter.emit('reloadWeb',todo);
    	}
    }
    return <TodoItem todo={todo} key={todo._id} path={this.props.path} navigator={this.props.navigator} user={this.user} update={this} listId={this.props.listId} />;
  },

  renderHeader() {
    return <TodoItemAdd listId={this.props.listId} user={this.user} />;
  },
  nextPage(){
  	if(TodosDB.connectionError())
  	{
  		return;
  	}
  	var time = this.dataSource[this.dataSource.length-1].ts;
  	let listId = this.props.listId;
  	time = new Date(time).getTime();
  	TodosDB.subscribeToTodos(listId,new Date(time))
      	.then(() => {
        	TodosDB.observeTodos(listId, (results) => {
          		
          		if(results.length == 0)
          		{
          			this.currentData=[];
          		}
          		else
          		{
          			this.currentData=results;
          		}
          		if(results.length>0)
          		{
          			var data = this.dataSource.concat(results);
          			this.dataSource=data;
          		}
          		this.setState({todos: this.state.todos.cloneWithRows(this.dataSource)});
          		AsyncStorage.setItem('message'+this.props.listId,JSON.stringify(this.dataSource));
        	},this.count,new Date(time));
      	})
      	.catch((err) => {
        	console.log('Error: ', err);
      });
  },
  testAddData(){
  	var data ={'_id':'CuqPZ8pKx46LzFtvq2','rid':'DfzrfamqHmyekknov','msg':'I don\'t think that you52','ts':'ISODate("2016-05-24T09:40:33.681Z")','u':'{"_id":"6waYypq42GRWmgXiA","username":"admin"}'};
  	this.dataSource.push(data);
  	this.setState({todos: this.state.todos.cloneWithRows(this.dataSource)});
  },
  scrollTo(){
  	this.refs.LISTVIEW.scrollTo({y:0,animated:true});
  },
  renderFooter() {
  	if(this.currentData.length>0 && this.currentData.length >= this.count)
  	{
    	return <TodoItemMore key={'more'} listId={this.props.listId} user={this.user} update={this} />;
    }
    else
    {
    	return null;
    }
  },
  // Component Render
  render() {
    return (
      <ListView 
      	ref='LISTVIEW'
      	bounces = {false}
        dataSource={this.state.todos}
        renderRow={this.renderItem}
        renderHeader={this.renderHeader}
        renderFooter={this.renderFooter}
        />
    );
  }
});
