import React, {
  StyleSheet,
  View,
  Text,
  PixelRatio,
  Image,
  TouchableOpacity,
  ListView,
  TouchableHighlight,
  ScrollView,
  Navigator,
  Alert,
} from 'react-native';
let {AsyncStorage} = React;

import openSquare from '../../images/fa-square-o/fa-square-o.png';
import checkedSquare from '../../images/fa-check-square-o/fa-check-square-o.png';
import trash from '../../images/fa-trash-o/fa-trash-o.png';

import TodosDB from '../../config/db/todos';
import error from '../../images/fa-error-icon/fa-error-icon.png';
import send from '../../images/fa-send-icon/fa-send-icon.png';

export default React.createClass({
  // Configuration
  displayName: 'Send Todo Item',
  propTypes: {
    todo: React.PropTypes.object.isRequired,
    path:React.PropTypes.string,
    navigator:React.PropTypes.object.isRequired,
    todos:React.PropTypes.array.isRequired,
    listId: React.PropTypes.string,
    update:React.PropTypes.object.isRequired
  },
  color:['.1','.2','.3','.4','.5','.6'],
  // Initial State
  getInitialState() {
    return {
      filePath:'',
      user:{}
    }
  },
  componentWillMount() {
  
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
    });
    },
  // Sub-render
  processStorage(_id,isDelete){
  	//Alert.alert('','processStorage');
  	AsyncStorage.getItem('messageSAE'+this.props.listId,(error,result)=>{
  		if(result){
  			let message = JSON.parse(result);
  			//console.log(message);
  			var results = [];
  			var errors = [];
  			var infos = [];
  			if(message.info && message.info.length > 0)
  			{
  				let todos = message.info;
  				for(var i = 0;i<todos.length;i++)
  				{
  					todo = todos[i];
  					results.push({_id:i+1,msg:todo.msg,rid:todo.rid,u:todo.u,status:1});
  				}
  				infos = todos;
  			}
  			
  			var t = results.length;
  			var ds = 0;
  			for(var i = 0;i<this.props.todos.length;i++)
  			{
  				let todo = this.props.todos[i];
  				if((todo.status == 0) && (i == (_id-1)))
  				{
  					if(!isDelete)
  					{
  						this.props.update.updateResend();
  						TodosDB.addTodo(todo.msg, todo.rid,todo.u);
  					}
  					else
  					{
  						ds = 1;
  					}
  				}
  				else
  				{
  					if(todo.status == 0)
  					{
  						t++;
  						if(todo.code && todo.error)
  						{
  							errors.push({msg:todo.msg,rid:todo.rid,code:todo.code,error:todo.error,u:todo.u});
  						}
  						else
  						{
  							errors.push({msg:todo.msg,rid:todo.rid,u:todo.u});
  						}
  						var code = null;
  						if(todo.code) code = todo.code;
  						var error = null;
  						if(todo.error) error = todo.error;
  						results.push({_id:t,msg:todo.msg,rid:todo.rid,u:todo.u,code:code,error:error,status:0});
  					}
  				}
  			}
  			var r = {'info':infos,'error':errors};
  			AsyncStorage.setItem('messageSAE'+this.props.listId,JSON.stringify(r));
  			this.props.update.updateRow(results);
  			if(isDelete && ds)
  			{
  				Alert.alert('','Delete success.');
  			}
  			else
  			{
  				//Alert.alert('','Resend success.');
  			}
  		}
  	});//*/
  },
  deleteMessage(_id){
  	//console.log(this.props.todos);
  	//Alert.alert('',this.props.todos[_id-1].msg);
  	this.processStorage(_id,1);
  },
  renderDelete() {
    let todo = this.props.todo;

    if (!todo.status) {
      let trashIcon = trash;
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={() => this.deleteMessage(todo._id)}
        >
          <Image
            source={trashIcon}
            style={styles.rightIcon}
            />
        </TouchableOpacity>
      );
    }
    return null;
  },
  sendMessage(todo){
  	if(todo.code)
  	{
  		Alert.alert('error Message',todo.error,[
  		{text:'Cancel'},
  		{text:'Delete',onPress:()=>{this.deleteMessage(todo._id)}},
  		{text:'Copy',onPress:()=>{require('react-native').NativeAppEventEmitter.emit('copymsg',todo.msg); Alert.alert('','Copy success.',[{text:'OK',onPress:()=>{this.props.navigator.pop();}}])}},
  		{text:'Resend',onPress:()=>{if(!TodosDB.connectionError()){this.processStorage(todo._id,0);}}}]
  		);
  	}
  	else
  	{
  		Alert.alert('Select Operate','',[
  		{text:'Cancel'},
  		{text:'Delete',onPress:()=>{this.deleteMessage(todo._id)}},
  		{text:'Resend',onPress:()=>{if(!TodosDB.connectionError()){this.processStorage(todo._id,0);}}}]
  		);
  	}//*/
  	//TodosDB.addTodo(this.props.todos[_id-1].msg, this.props.todos[_id-1].rid,this.props.todos[_id-1].u);
  },
  renderErrorAction() {
    let todo = this.props.todo;

    if (!todo.status) {
    	return (
    	<TouchableOpacity
        onPress={() => this.sendMessage(todo)}
      >
        <Image
          source={error}
          style={{width:21,height:21}}
          />
        </TouchableOpacity>
    	);
    }
    return null;
  },
  renderCheckAction(checked) {
    let actionIcon = openSquare;
    if (checked) {
      actionIcon = checkedSquare;
    }

    return (
        <Image
          source={actionIcon}
          style={{width:12,height:12,tintColor:'rgba(0, 0, 0, 0.25)'}}
        />
    );
  },
  renderImage() {
    let todo = this.props.todo;
	let file = todo.attachments;
	if(file && file.length > 0)
	{
		let address = TodosDB.hostAddress();
		let att = file[0];
		if(att.image_url)
		{
			return (
        	<Image
          		source={{uri:TodosDB.hostAddress()+att.image_url+'?rc_token='+this.state.user.token+'&rc_uid='+this.state.user._id}}
          		style={styles.image}
          	/>
    		);
    	}
    	else
    	{
    		return null;
    	}
    }
    return null;
  },
  _renderImageURL(todo) {
	let file = todo.attachments;
	if(file && file.length > 0)
	{
		let address = TodosDB.hostAddress();
		let att = file[0];
		if(att.image_url)
		{
			return TodosDB.hostAddress()+att.image_url;
    	}
    	else
    	{
    		return null;
    	}
    }
    return null;
  },
  _renderProcessString(string)
  {
  	var array = [];
    var string = string.replace(/\[[X]\]/gm,'[x]');
    var	zxArray = string.split('[x]');
    if(zxArray.length ==1)
    {
        zArray = string.split('[]');
        if(zArray.length == 1)
        {
        	array.push(string);	 
        }
        else
        {
        	for(var i=0;i<zArray.length;i++)
        	{
        		if(zArray[i].length == 0)
        		{
        			if(i < zArray.length-1) array.push('[]');
        		}
        		else
        		{
        			array.push(zArray[i]);
        			if(i < zArray.length-1) array.push('[]');
        		}
        	}
        }
    }
    else
    {
        for(var i=0;i<zxArray.length;i++)
        {
        	if(zxArray[i].length == 0)
        	{
        		if(i < zxArray.length-1) array.push('[x]');
        	}
        	else
        	{
        		var str = zxArray[i];
        		var zArray = str.split('[]');
        		if(zArray.length == 1)
        		{
        			array.push(str);
        			if(i < zxArray.length-1) array.push('[x]');
        		}
        		else
        		{
        			for(var j=0;j<zArray.length;j++)
        			{
        				if(zArray[j].length == 0)
        				{
        					if(j < zArray.length-1) array.push('[]');
        				}
        				else
        				{
        					array.push(zArray[j]);
        					if(j < zArray.length-1) array.push('[]');
        				}
        			}
        			if(i < zxArray.length-1) array.push('[x]');
        		}
        	}
        }
    }
    return array;
  },
  _renderType(value)
  {
  	if(value == '[x]')
  	{
  		return this.renderCheckAction(1);
  	}
  	else if(value == '[]')
  	{
  		return this.renderCheckAction(0);
  	}
  	return value;
  },
  _renderText(text)
  {
  	if(text.length <= 0)
  	{
  		return <Text>{'  '}</Text>
  	}
  	var array = this._renderProcessString(text);
    return array.map((value,i)=>{
        return (<Text key={'text'+i}>
        	{this._renderType(value)}
        </Text>);
    });
  },
  _renderRow(rowData)
  {
  	return rowData.map((row,i) =>{
  		return (<View key={i} style = {styles.cellView}>
                {this._renderText(row)}
        </View>);
    });
  },
  _rightRenderRow (rowData, sectionID, rowID){
    return (
    	<View style = {{flexDirection:'row'}}>
            {this._renderRow(rowData)}
        </View>
    );
  },
  _showRenderMessage(){
  	let todo = this.props.todo;
  	let textStyle = [];
    if (todo.checked) {
      textStyle.push(styles.textChecked);
    }
    let msg = todo.msg
    if(this.changeBackgroundColor(todo.msg))
    {
    	msg = todo.msg.substr(2);
    }
  	if(msg.split('\t').length > 2)
    {
        var row = msg.split('\n');
        var column = [];
        for(var i=0;i<row.length;i++)
        {
        	var data = row[i].split('\t');
        	 column.push(data);
        }
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); 
    
        return(
        <View style = {{flex:3}}>
           <ScrollView style = {{flex: 1,marginRight:1,marginLeft:1,marginTop:0,marginBottom:1,flexDirection: 'column'}}
                       bounces = {false}
                       showsHorizontalScrollIndicator = {true}
                       showsVerticalScrollIndicator = {true}
                       horizontal = {true}>
                       <View style = {{height:280,flexDirection: 'column'}}>

                       <ListView
                        showsHorizontalScrollIndicator = {false}
                        showsVerticalScrollIndicator = {false}
                        // bounces = {false}
                        // scrollEventThrottle={1000}
                        style = {{flex: 1}}
                        dataSource = {ds.cloneWithRows(column)}
                        renderRow = {this._rightRenderRow}
                       />
                       </View>
           </ScrollView>
        </View>
        );
    }
    else//*/
    {
    	var array = this._renderProcessString(todo.msg);
    	return array.map((value,i)=>{
        	return (<Text key={i} style={textStyle}>
        		{this._renderType(value)}
        	</Text>);
        });
    }
  },
  changeBackgroundColor(msg)
  {
  	var result = 0;
  	for(var i =0;i<this.color.length;i++)
  	{
  		if(msg.indexOf(this.color[i]) == 0)
  		{
  			result = i+1;
  			break;
  		}
  	}
  	return result;
  },
  // Component Render
  render() {
    let todo = this.props.todo;
	var url = this._renderImageURL(todo);
	if(!todo) return null;
	let textStyle = [];
	var r = this.changeBackgroundColor(todo.msg);
	textStyle.push(styles.row);
    if (r) {
      textStyle.push(styles['mark'+r]);
    }
    return (
      <View key={todo._id}>
        <View>
      		{this.renderImage()}
		</View>
        <View style={textStyle}>
        	{this.renderErrorAction()}
          	{this._showRenderMessage()}
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
  mark1:{
		backgroundColor: 'rgb(255,240,240)'
	},
	mark2:{
		backgroundColor: 'rgb(255,255,240)'
	},
	mark3:{
		backgroundColor: 'rgb(240,255,240)'
	},
	mark4:{
		backgroundColor: 'rgb(240,255,255)'
	},
	mark5:{
		backgroundColor: 'rgb(240,240,255)'
	},
	mark6:{
		backgroundColor: 'rgb(255,240,255)'
	},
  image: {
  	marginLeft:15,
  	marginTop:5,
    width: 100,
    height: 100
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
  cellView: {
    height:35,
    borderColor: '#DCD7CD',
    borderRightWidth:1,
    borderBottomWidth:1,
    alignItems: 'center',      // 水平局中
    justifyContent: 'center',  // 垂直居中
  }
});
