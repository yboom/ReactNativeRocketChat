import React, {
  TouchableHighlight,
  ListView,
  Alert,
} from 'react-native';
let {AsyncStorage} = React;//require('react-native');;

import SendTodoItem from './sendtodoItem';

import TodosDB from '../../config/db/todos';

export default React.createClass({
  // Configuration
  displayName: 'SendTodos',
  propTypes: {
    listId: React.PropTypes.string,
    path:React.PropTypes.string,
    navigator:React.PropTypes.object.isRequired
  },
  resend:false,
  // Initial Value (State and Props)
  getInitialState() {
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      todos: ds.cloneWithRows([]),
      saveMessages:[]
    };
  },
  sendsuccess:null,
  sendfailed:null,
  finishMessage:[],
  // Component Lifecycle
  componentWillMount() {
  	//this.testError();
  	this.sendsuccess = require('react-native').NativeAppEventEmitter.addListener('Sendsuccess',(body)=>{
  		if(this.resend){
  			this.resend=false;Alert.alert('','Send success.');
  		}
  		else
  		{
  			this.processSuccessMessage(body);
  		}
  	});
  	this.sendfailed = require('react-native').NativeAppEventEmitter.addListener('Sendfailed',(body)=>{
  		this.processStorage(this.props.listId,0);
  		Alert.alert('','Send failed.');
  	});
    let listId = this.props.listId;
    this.processStorage(listId,1);
  },
  processStorage(listId,time)
  {
  	AsyncStorage.getItem('messageSAE'+listId,(error,result)=>{
  		if(result){
  			let message = JSON.parse(result);
  			//console.log(message);
  			var results = [];
  			if(message.info && message.info.length > 0)
  			{
  				let todos = message.info;
  				for(var i = 0;i<todos.length;i++)
  				{
  					todo = todos[i];
  					results.push({_id:i+1,msg:todo.msg,rid:todo.rid,u:todo.u,status:1});
  				}
  			}
  			if(message.error && message.error.length > 0)
  			{
  				let todos = message.error;
  				var t = 0;
  				if(message.info) t = message.info.length;
  				for(var i = 0;i<todos.length;i++)
  				{
  					todo = todos[i];
  					var code = null;
  					if(todo.code) code = todo.code;
  					var error = null;
  					if(todo.error) error = todo.error;
  					results.push({_id:t+i+1,msg:todo.msg,rid:todo.rid,u:todo.u,code:code,error:error,status:0});
  				}
  			}
  			this.setState({saveMessages:results});
  			this.setState({todos: this.state.todos.cloneWithRows(results)});
  			if(time) 
  			{
  				if(!TodosDB.connectionError())
  				{
  					if(results.length > 0)
  					{
  						setTimeout(()=>{this.beginSendMessage(results,message.error);},2000);
  					}
  				}
  				else
  				{
  					Alert.alert('','Server connect error or network is down!');
  				}
  				//setTimeout(()=>{this.props.navigator.rightButton = {title:' ',handler:this._handleMessage()};},2000);
  			}
  			
  		}
  	});
  },
  componentWillUnmount(){
  	clearTimeout();
  	this.sendsuccess.remove();
   	this.sendfailed.remove();
  },
  beginSendMessage(results,errors){
  	let t = results.shift();
  	if(t.status) 
  	{
  		//var result = {'info':[],'error':errors};
  		//AsyncStorage.setItem('messageSAE'+this.props.listId,JSON.stringify(result));
  		TodosDB.addTodos(t.msg, t.rid,t.u);
  		
  		this.setState({saveMessages:results});
  		this.setState({todos: this.state.todos.cloneWithRows(results)});
  	}
  },
  processSuccessMessage(msg){
  	this.finishMessage.push(msg);
  	this.updateLocalStorage(msg);
  	let data = this.state.saveMessage;
  	let t = null;
  	if(data&&data.length>0) data.shift();
  	if(t&&t.status) 
  	{
  		setTimeout(()=>{TodosDB.addTodos(t.msg, t.rid,t.u);},1000);
  		this.setState({saveMessages:data});
  		this.setState({todos: this.state.todos.cloneWithRows(data)});
  	}
  	else
  	{
  		if(data&&data.length>0)
  		{
  			this.setState({saveMessages:data});
  			this.setState({todos: this.state.todos.cloneWithRows(data)});
  		}
  		else
  		{
  			this.setState({saveMessages:[]});
  			this.setState({todos: this.state.todos.cloneWithRows([])});
  		}
  		require('react-native').NativeAppEventEmitter.emit('sendMessage',this.finishMessage);
  	}
  },
  sendMessage(result)
  {
  	let message = JSON.parse(result);
  	if(message.info && message.info.length > 0)
  	{
  		let todos = message.info;
  		let stodos = todos;
  		let errors = [];
  		if(message.error && message.error.length > 0) errors = message.error;
  		var index = 0;
  		let self = this;
  		function sm()
  		{
  			//console.log('sm');
  			if(index >= todos.length)
  			{
      			var results = {'info':[],'error':errors};
  				self.updateLocalStorage(results);
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
  updateLocalStorage(res)
  {
  	//AsyncStorage.setItem('messageSAE'+this.props.listId,JSON.stringify(result));
  	//Alert.alert('','Send finish.');
  	//this.updateRow(result.error);
  	AsyncStorage.getItem('messageSAE'+this.props.listId,(error,result)=>{
  		if(result){
  			let message = JSON.parse(result);
  			//console.log(message);
  			let infos = [];
  			let errors = [];
  			if(message.info && message.info.length > 0)
  			{
  				let todos = message.info;
  				for(var i = 0;i<todos.length;i++)
  				{
  					let todo = todos[i];
  					if(todo.msg != res.msg)
  					{
  						infos.push(todo);
  					}
  				}
  			}
  			if(message.error && message.error.length > 0) errors = message.error;
  			
  			let results = {'info':infos,'error':errors};
  			AsyncStorage.setItem('messageSAE'+this.props.listId,JSON.stringify(results));
  		}
  	});
  },
  _handleMessage(){
  	//Alert.alert('','message');
  	if(!TodosDB.connectionError())
  	{
  		let self = this;
  		AsyncStorage.getItem('messageSAE'+this.props.listId,(error,result)=>{
  			if(result)
  			{
  				self.sendMessage(result);
  			}
  		});
  	}
  },
  updateResend(){
  	this.resend = true;
  },
  // Sub-render
  updateRow(info){
  	this.setState({todos: this.state.todos.cloneWithRows(info)});
  },
  renderItem(todo) {
  	//console.log(todo);
  	if(!todo) return null;
    return <SendTodoItem todo={todo} key={todo._id} path={this.props.path} navigator={this.props.navigator} todos={this.state.saveMessages} listId={this.props.listId} update={this}/>;
  },

  renderHeader() {
    return null;
  },
  // Component Render
  render() {
    return (
      <ListView 
      	bounces = {false}
        dataSource={this.state.todos}
        renderRow={this.renderItem}
        renderHeader={this.renderHeader}
        />
    );
  }
});
