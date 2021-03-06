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
  Modal,
} from 'react-native';
let {AsyncStorage} = React;
let _ = require("underscore");

import openSquare from '../../images/fa-square-o/fa-square-o.png';
import checkedSquare from '../../images/fa-check-square-o/fa-check-square-o.png';
import trash from '../../images/fa-trash-o/fa-trash-o.png';

import TodosDB from '../../config/db/todos';
import Webview from '../view/webview';
import ImageView from '../view/imageview';
import Detailedview from '../view/detailedview';
import ImageAndroid from 'react-native-image-zoom';
import Lightbox from 'react-native-lightbox';
import icon from '../../images/fa-cog/fa-cog.png';
import copy from '../../images/fa-copy-icon/fa-copy-icon.png';

//import NativeModules from 'react-native';
var DocumentController = require("NativeModules").DocumentController;

var myClass = require("NativeModules").MyClass;
//var color = ['.1','.2','.3','.4','.5','.6'];
export default React.createClass({
  // Configuration
  displayName: 'Todo Item',
  propTypes: {
    todo: React.PropTypes.object.isRequired,
    path:React.PropTypes.string,
    navigator:React.PropTypes.object.isRequired,
    user:React.PropTypes.object.isRequired,
    update:React.PropTypes.object.isRequired,
    listId:React.PropTypes.string
  },
  color:['.1','.2','.3','.4','.5','.6'],
  urls:[],
  // Initial State
  getInitialState() {
    return {
      filePath:'',
      pageIndex:0,
      showTool:false
    }
  },
  replaceScene(){
  	this.setState({pageIndex:1});
  },
  closeModal(){
  	this.setState({pageIndex:0});
  },
  componentWillMount() {
   
   },
  componentWillUnmount(){
  	
  },
  setClickId(){
  	this.props.update.currentClickId('','');
  },
  // Sub-render
  renderDelete() {
    let todo = this.props.todo;

    if (todo.checked) {
      let trashIcon = trash;
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={() => TodosDB.deleteTodo(todo)}
        >
          <Image
            source={trashIcon}
            style={styles.rightIcon}
            />
        </TouchableOpacity>
      );
    }
  },

  renderAction() {
    let todo = this.props.todo;

    let actionIcon = openSquare;
    if (todo.checked) {
      actionIcon = checkedSquare;
    }

    return (
      <TouchableOpacity
        onPress={() => TodosDB.changeTodoState(todo, !todo.checked)}
      >
        <Image
          source={actionIcon}
          style={styles.leftIcon}
          />
      </TouchableOpacity>
    );
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
			<TouchableHighlight
      			underlayColor='rgba(0, 0, 0, 0)'
        		onPress={() => {
        		if(require('react-native').Platform.OS === 'ios')
        		{
        			this.replaceScene();
        		}
        		else
        		{
        			this.handlePressImage(address+att.image_url)
        		}
        	}}>
        	<View>
        	<Image
          		source={{uri:address+att.image_url+'?rc_token='+this.props.user.token+'&rc_uid='+this.props.user._id}}
          		style={styles.image}
          	/>
        	</View>
        	</TouchableHighlight>);
    	}
    	else
    	{
    		if(att.title_link)
    		{
    			return (
    			<TouchableHighlight
      				underlayColor='rgba(0, 0, 0, 0)'
        			onPress={() => {
        				if(require('react-native').Platform.OS === 'ios')
        				{
        					myClass.loadFile({url:address+att.title_link,token:'rc_token='+this.props.user.token+'; rc_uid='+this.props.user._id,rid:this.props.listId,fid:todo.file._id},
        					(error,result)=>{
        					if(error){Alert.alert('',result);}
        					else
        					{
        						//DocumentController.show({file: result});
							}
						});
						}
						else
						{
							myClass.loadFile(address+att.title_link,'?rc_token='+this.props.user.token+'&rc_uid='+this.props.user._id,this.props.listId,todo.file._id,
							(msg)=>{
								Alert.alert('',msg,[{text:'OK',onPress:()=>{myClass.beginFile((msg)=>{Alert.alert('',msg);})}}]);
							});
							
						}
        			}}>
      			<Text style={{color:'blue',fontWeight:'bold',marginLeft:15,textDecorationLine:'underline'}}>{att.title}</Text>
      			</TouchableHighlight>);
    		}
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
  _Eval(string,type)
  {
  	var cal='+-*/().:＋－＊／（）：';//['+','-','*','/','(',')','.','－','d','a','y'];
  	var result = '';
  		for(var j=0;j<string.length;j++)
  		{
  			var noRight = false;
  			var chart = string.substring(string.length-j-1,string.length-j);
  			if(!isNaN(chart) && chart != ' ' && j<string.length-1) continue;
  			if(chart == ':' || chart == '：')
  			{
  				var str = string.substring(0,string.length-j-1);
  				//console.log(str);
  				str = str.replace(/（/gm,'(');
  				var ri_qi = str.indexOf('day(');
   				var right = str.lastIndexOf('(');
  				if(right > -1 && ri_qi > -1)
  				{
					chart = '(';
					var l = str.length - right;
					j = j + l;
					//console.log(l);
				}
				else
				{
					noRight = true;
				}
  			}
  			if((chart == '(' || chart == '（') && (j+3 < string.length))
  			{
  				var l = string.length-j-4;
  				if(l>=0)
  				{
  					var d = string.substring(l,l+3);
  					//console.log('day='+d);
  					if(d == 'day')
  					{
  						if(l>0)
  						{
  							var f = string.substring(l-1,l);
  							//console.log('f='+f);
  							if(cal.indexOf(f) > -1 && (f!='(' || f!= ')' || f!='（' || f!= '）'))
  							{
  								//console.log('jump 3');
  								j = j+3;
  							}
  							else
  							{
  								var str = string.substring(string.length-j);
  								str = 'day'+chart+str;
  								//console.log(str);
  								str = str.replace(/（/gm,'(');
  								str = str.replace(/）/gm,')');
  								//str = str.replace(/\./gm,'-');
  								str = str.replace(/t/gm,'T');
  								str = str.replace(/：/gm,':');
  								var day = str.split('day(');
  								//console.log(str);
  								if(day.length > 0)
  								{
  									var daystring = '';//day[0];
  									if(day[0].length > 0) daystring = day[0];
  									for(var k=1;k<day.length;k++)
  									{
  										var d = day[k];
  										var sday = d.replace(/ /gm,'')
										var st = sday.split('T')
										var s = st[0].replace(/\./gm,'-')
										sday = s
										if(st.length > 1) sday += 'T' + st[1]
										index = sday.indexOf(')')
  										daystring += 'new Date("' + sday.substring(0,index) +'")/1000/3600/24'+ sday.substring(index+1);
  									}
  									str = daystring;
  								}
  								//console.log(str);
  								try
  								{
  									var r = eval(str);
  									result += string + '=' + r;
  									if(type)
  									{
										result = result.replace(string+'=','');
										result = result.replace('? ','');
										result = eval(result);
									}
  								}
  								catch(e)
  								{
  									result += string + '=? ';
  									if(type) result = 0;
  								}
  								break;
  							}
  						}
  					}
  				}
  			}
  			if((cal.indexOf(chart) == -1) || (cal.indexOf(chart) > -1 && j == string.length-1) || noRight)
  			{
  				var str = string.substring(string.length-j);
  				if(j == string.length-1) str = string.substring(string.length-j-1);
  				//console.log(str);
  				str = str.replace(/（/gm,'(');
  				str = str.replace(/）/gm,')');
  				str = str.replace(/＋/gm,'+');
  				str = str.replace(/－/gm,'-');
  				str = str.replace(/＊/gm,'*');
  				str = str.replace(/／/gm,'/');
  				var left =str.split('(');
  				var right = str.split(')');
  				if(left.length > 1 && left[left.length-1].length > 0 && left.length == right.length)
  				{
  					try
  					{
  						var r = eval(str);
  						result += string + '=' + r;
  						if(type)
  						{
							result = result.replace(string+'=','');
							result = result.replace('? ','');
							result = eval(result);
						}
  					}
  					catch(e)
  					{
  						result += string + '=? ';
  						if(type) result = 0;
  					}
  				}
  				else
  				{
  					try
  					{
  						var r = eval(str);
  						if(!isNaN(r))
  						{
  							result += string + '=' + r;
  							if(type)
  							{
								result = result.replace(string+'=','');
								result = result.replace('? ','');
								result = eval(result);
							}
  						}
  						else
  						{
  							result += string + '=? ';
  							if(type) result = 0;
  						}
  					}
  					catch(e)
  					{
  						result += string + '=? ';
  						if(type) result = 0;
  					}
  				}
  				break;
  			}
  		}
  	return result;
  },
  _sumEval(message,load,column)
  {
	var s = 0
	if( message.urls && message.urls.length > 0)
	{
		//console.log(message.urls);
		for(var i=0;i<message.urls.length;i++)
		{	
			var url = message.urls[i];		
			if (!url || !url.meta || !url.meta.msg || !url.meta.msg.msg)
			{
				continue;
			}
			var value = url.meta.msg.msg;
			//console.log(value);
			var msg = this.processURLs(url.meta.msg.rid,url.meta.msg._id,-1,-1);
			if(msg)
			{
				value = msg.msg;
			}
			var string = value.replace(/=？/gm,'=?');
			string = string.replace(/＝？/gm,'=?');
			string = string.replace(/＝\?/gm,'=?');
			var  array = string.split("=?");
			if (array.length >= column)
			{
				var s_value = array[column-1];
				if (s_value.length == 0)
				{
					s = s + 0;
				}
				else
				{
					var str_value = s_value.replace(/（/gm,'(');
					str_value = str_value.replace(/）/gm,')');
					var sumArray = str_value.split("sum(");
					if(sumArray.length > 1)
					{
						for (var j=1; j<sumArray.length;j++)
						{
							var str = sumArray[j];
							var index = str.indexOf(')');
							var msg = this.processURLs(url.meta.msg.rid,url.meta.msg._id,-1,-1);
							//console.log(msg);
							if(msg)
							{
								var v = this._sumEval(msg,load,str.substring(0,index));
								s_value = s_value.replace('sum('+str.substring(0, index)+')',v);
							}
							else
							{
								var v = this._sumEval(url.meta.msg,load,str.substring(0,index));
								s_value = s_value.replace('sum('+str.substring(0, index)+')',v);
							}
							//console.log s_value
						}
					}
					s = this._Eval(s_value,true) + s;
				}
			}
		}
	}
	return s;
  },
  _evalExpression(string)
  {
	var cal='+-*/().:＋－＊／（）：';//['+','-','*','/','(',')','.','－','d','a','y'];
  	var result = '';
  		for(var j=0;j<string.length;j++)
  		{
  			var noRight = false;
  			var chart = string.substring(string.length-j-1,string.length-j);
  			if(!isNaN(chart) && chart != ' ' && j<string.length-1) continue;
  			if(chart == ':' || chart == '：')
  			{
  				var str = string.substring(0,string.length-j-1);
  				//console.log(str);
  				var ri_qi = str.indexOf('day(');
				if(ri_qi == -1)
					ri_qi = str.indexOf('day（');
  				//str = str.replace(/（/gm,'(');
  				var right = str.lastIndexOf('(');
				//console.log right
				if(right > -1 && ri_qi > -1)
				{
					chart = '(';
				}
				else
				{
					right = str.lastIndexOf('（');
					if(right > -1 && ri_qi > -1)
					{
						chart = '（';
					}
				}
  				if(right > -1 && ri_qi > -1)
  				{
					var l = str.length - right;
					j = j + l;
					//console.log(l);
				}
				else
				{
					noRight = true;
				}
  			}
  			if((chart == '(' || chart == '（') && (j+3 < string.length))
  			{
  				var l = string.length-j-4;
  				if(l>=0)
  				{
  					var d = string.substring(l,l+3);
  					//console.log('day='+d);
  					if(d == 'day' || d == 'sum')
  					{
  						if(l>0)
  						{
  							var f = string.substring(l-1,l);
  							//console.log('f='+f);
  							if(cal.indexOf(f) > -1 && (f!='(' || f!= ')' || f!='（' || f!= '）'))
  							{
  								//console.log('jump 3');
  								j = j+3;
  							}
  							else
  							{
  								var str = string.substring(string.length-j);
  								if(d == 'day')
  								{
									result = 'day'+chart+str;
									//console.log(result);
								}
								else
								{
									result = 'sum'+chart+str;
								}
  								break;
  							}
  						}
  					}
  				}
  			}
  			if((cal.indexOf(chart) == -1) || (cal.indexOf(chart) > -1 && j == string.length-1) || noRight)
  			{
  				result = string.substring(string.length-j);
  				if(j == string.length-1) result = string.substring(string.length-j-1);
  				break;
  			}
  		}
  	return result;
  },
  _renderEval(value,msg,load,html)
  {
  	var result = '';
  	//console.log(value);
  	var array = value;
  	if(!_.isArray(value))
  	{
  		var string = value;
  		value = value.replace(/=？/gm,'=?');
  		value = value.replace(/＝？/gm,'=?');
  		value = value.replace(/＝\?/gm,'=?');
  		array = value.split('=?');
  		if(array.length <= 1)
  		{
  			return string;
  		}
  	}
  	var cal='+-*/().:＋－＊／（）：';//['+','-','*','/','(',')','.','－','d','a','y'];
  	for(var i=0;i<array.length-1;i++)
  	{
  		var string = array[i];
  		if(string.length == 0) continue;
  		
  		var str_value = string;                                                                                    
        str_value = str_value.replace(/（/gm, '(');                                                             
        str_value = str_value.replace(/）/gm, ')');                                                             
        var sumArray = str_value.split("sum(");                                                                   
        if (sumArray.length > 1) 
        {                                                                            
            for (j = 1; j<sumArray.length;j++) 
            {                                         
              var str = sumArray[j];                                                                                 
              var index = str.indexOf(')');                                                                          
              var v = this._sumEval(msg,load, str.substring(0, index));                                                        
              var str_sum = 'sum(' + str.substring(0, index) + ')';                                                  
              str_value = str_value.replace(str_sum, v);                                                         
        	}
        	//console.log(str_value);                                                                                                    
        }                                                                                                      
        var str = this._Eval(str_value, true);
        if(html)
        {
        	expression = this._evalExpression(string);
			prev = string.replace(expression,'');
			if(expression.length == 0)
			{
				expression = string;
				prev = ' ';
			}
			//result += string + '=' + str
			expression = expression.replace(/ /gm, '');
			expression = expression.replace(/\n/gm, '');
			result += prev+'<a href="javascript:void(0)" style="text-decoration:none;" id="'+msg._id+i+'" class="equ-link" onclick="return showInfo(this,\''+msg._id+i+'\',\''+expression+'\')" title="'+expression+'" alt="'+expression+'">'+str+'</a>&nbsp;&nbsp;&nbsp;'
        }
        else
        {                                                                          
        	result += string + '=' + str;
        }
  	}
  	var last = array[array.length-1].replace("<<<","");
  	result += last;
  	//console.log(result);
  	return result;
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
  	let s = value;
  	value = value.replace(/=？/gm,'=?');
  	value = value.replace(/＝？/gm,'=?');
  	value = value.replace(/＝\?/gm,'=?');
  	var array = value.split('=?');
  	if(array.length > 1)
  	{
  		return this._renderEval(array,this.props.todo,false,false);
  	}
  	else
  	{
  		return s.replace("<<<","");
  	}
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
  	//return <Text>{text}</Text>;
  },
  _renderRow(rowData)
  {
  	//console.log(rowData)
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
    
        //this.setState({scrollViewDataSource: this.state.scrollViewDataSource.cloneWithRows(column)});
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
    	var array = this._renderProcessString(msg);
    	return array.map((value,i)=>{
        	return (<Text key={i} style={textStyle}>
        		{this._renderType(value)}
        	</Text>);
        });
    	// /\[\]/gm
    	// /\[[xX]\]/gm
    }
  },
  // Event Handlers
  processURLs(listName,id,cur,index)
  {
  	let mes = TodosDB.findOneMessage(id);
  	if(mes)
  	{
  		return mes;
  	}
  	if(TodosDB.connectionError())
  	{
  		AsyncStorage.getItem('message'+id,(error,result)=>{
  			if(result)
  			{
  				result = JSON.parse(result);
  				result.id = index;
   				require('react-native').NativeAppEventEmitter.emit('subscribOneMessage',result);
  			}
  		});
  	}
  	else
  	{
  		TodosDB.subscribeToOneTodos(listName,[id])
   			.then(()=>{
   				TodosDB.observeOneTodos(id,(result)=>{
   				//console.log(result);
   				if(!cur&&result)
   				{
   					AsyncStorage.setItem('message'+result._id,JSON.stringify(result));
   					result.id = index;
   					require('react-native').NativeAppEventEmitter.emit('subscribOneMessage',result);
   				}});
   			})
   			.catch((err) => {
        	console.log(err);
    	});
    }
  	return null;
  },
  processURLArray(todo,message,cur)
  {
  	if(!todo) todo = this.props.todo;
  	var urlHTML = false;
  	if(todo.urls && todo.urls.length > 0)
	{
		let urls = todo.urls;
		//console.log(urls);
		if(this.urls.length > 0 && cur) this.urls = [];
		for(var i=0;i<urls.length;i++)
		{
			let url = urls[i];
			let link = url.url;
			let host = url.parsedUrl.host;
			let query = url.parsedUrl.query;
			if((host == TodosDB.host()) && (query.indexOf('id=') == 0) && (query.indexOf('&') == -1))
			{
				urlHTML = true;
				let id = query.replace('id=','');
				let listName = url.parsedUrl.pathname.split('/').reverse().shift();
				//console.log(listName);
				//console.log(id);
				let j =i+1;
				let mes = this.processURLs(listName,id,cur,j);
				if(mes)
				{
					var url = this._renderImageURL(mes);
					let html = this.processHTML(mes,false);
					if(html)
					{
						if(url)
						{
							//message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+html+'</div><div style="margin-left:15px;"><img src="'+url+'" /></div>');
							message = message.concat('<br />['+j+']<div style="margin-left:15px;">'+html+'</div><div style="margin-left:15px;"><img src="'+url+'" /></div>');
						}
						else
						{
							//message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+html+'</div>');
							message = message.concat('<br />['+j+']<div style="margin-left:15px;">'+html+'</div>');
						}
					}
					else
					{
						if(url)
						{
							//message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+mes.msg+'</div><div style="margin-left:15px;"><img src="'+url+'" /></div>');
							message = message.concat('<br />['+j+']<div style="margin-left:15px;">'+mes.msg+'</div><div style="margin-left:15px;"><img src="'+url+'" /></div>');
						}
						else
						{
							//message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+mes.msg+'</div>');
							message = message.concat('<br />['+j+']<div style="margin-left:15px;">'+mes.msg+'</div>');
						}
					}
				}
				else
				{
					if(cur) this.urls.push({id:j,url:link,name:listName,_id:id});
					//message = message.replace(link,'<div id="'+id+'">['+j+']</div><br />'+'loading');
					message = message.concat('<div id="'+id+'">['+j+']</div><br />'+'loading');
				}
			}
		}
		//console.log(this.urls);
    }
    else
    {
    	if(cur) this.urls = [];
    }
    return message;
  },
  processHTML(todo,cur)
  {
  	if(!todo) todo = this.props.todo;
  	var message = todo.msg;
  	//console.log(message);
  	var urlHTML = false;
  	if(todo.urls && todo.urls.length > 0)
	{
		let urls = todo.urls;
		//console.log(urls);
		if(this.urls.length > 0 && cur) this.urls = [];
		for(var i=0;i<urls.length;i++)
		{
			let url = urls[i];
			let link = url.url;
			let host = url.parsedUrl.host;
			let query = url.parsedUrl.query;
			if((host == TodosDB.host()) && (query.indexOf('id=') == 0) && (query.indexOf('&') == -1))
			{
				urlHTML = true;
				let id = query.replace('id=','');
				let listName = url.parsedUrl.pathname.split('/').reverse().shift();
				//console.log(listName);
				//console.log(id);
				let j =i+1;
				let mes = this.processURLs(listName,id,cur,j);
				if(mes)
				{
					var url = null;//this._renderImageURL(mes);
					let html = this.processHTML(mes,false);
					if(html)
					{
						if(url)
						{
							message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+html+'</div><div style="margin-left:15px;"><img src="'+url+'" /></div>');
						}
						else
						{
							//message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+html+'</div>');
							message = message.replace(link,'&nbsp;&nbsp;<i class="icon-link">['+j+']</i>');
						}
					}
					else
					{
						if(url)
						{
							message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+mes.msg+'</div><div style="margin-left:15px;"><img src="'+url+'" /></div>');
						}
						else
						{
							//message = message.replace(link,'<br />['+j+']<div style="margin-left:15px;">'+mes.msg+'</div>');
							message = message.replace(link,'&nbsp;&nbsp;<i class="icon-link">['+j+']</i>');
						}
					}
				}
				else
				{
					if(cur) this.urls.push({id:j,url:link,name:listName,_id:id});
					//message = message.replace(link,'<div id="'+id+'">['+j+']</div><br />'+'loading');
					message = message.replace(link,'&nbsp;&nbsp;<i class="icon-link">['+j+']</i>');
				}
			}
		}
		//console.log(this.urls);
    }
    else
    {
    	if(cur) this.urls = [];
    }
    
  	var msg = message;
  	var html = false;
  	if(message.split("|").length > 2)
  	{
  		//console.log('split  | ');
  		html = true;
		lines = message.split(/[\n\r]/);
		firstLine = true;
		if(cur)
		{
			message = "<head><style>table{margin: 0;padding: 0;font-size: 100%;vertical-align: baseline;border-spacing: 0;border-collapse: collapse;\
						border-top-color: #808080;box-sizing:border-box;border-left: 1px solid #aaa; border-top: 1px solid #aaa;}\
						tr{margin: 0;padding: 0;border: 0;background-color:rgba(160,160,160,0.2);font-size: 100%;vertical-align: baseline;display: table-row;vertical-align: inherit;border-top-color: inherit;border-right-color: inherit;border-bottom-color: inherit;border-left-color: inherit;}\
						td{border-right: 1px solid #aaa;border-bottom: 1px solid #aaa;padding: 2px 4px;margin: 0;font-size: 100%;vertical-align: baseline;display: table-cell;vertical-align: inherit;}</style></head>";
		}
		else
		{
			message = "";
		}
		for(var i=0;i<lines.length;i++)//_.forEach lines, (line) ->
		{
			if (firstLine)
			{
				if (lines[i].indexOf('|')<0)
				{
					message+=lines[i]+"<br/>";
					continue;
				}
				message+='<div style="overflow-x:auto;"><table><tbody><tr class="first">';
			}
			else{
				message+="<tr>";
			}
			rows = lines[i].split('|');
			for(var j=0;j<rows.length;j++)//_.forEach rows, (row) ->
			{
				message+="<td>"+rows[j]+"</td>";
			}
			message+="</tr>";
			firstLine = false;
		}
		message+="</tbody></table></div>";
	}
	else
	{
		if (message.split("\t").length > 2)
		{
			//console.log('split  t ');
			html = true;
			lines = message.split(/[\n\r]/);
			firstLine = true;
			if(cur)
			{
				message = "<head><style>table{margin: 0;padding: 0;font-size: 100%;vertical-align: baseline;border-spacing: 0;border-collapse: collapse;\
						border-top-color: #808080;box-sizing:border-box;border-left: 1px solid #aaa; border-top: 1px solid #aaa;}\
						tr{margin: 0;padding: 0;border: 0;background-color:rgba(160,160,160,0.2);font-size: 100%;vertical-align: baseline;display: table-row;vertical-align: inherit;border-top-color: inherit;border-right-color: inherit;border-bottom-color: inherit;border-left-color: inherit;}\
						td{border-right: 1px solid #aaa;border-bottom: 1px solid #aaa;padding: 2px 4px;margin: 0;font-size: 100%;vertical-align: baseline;display: table-cell;vertical-align: inherit;}\
						</style></head>";
			}
			else
			{
				message = "";
			}
			//for table colspan rowspan
			merge_cell = false;
			last = "";
			tab_index = 0;
			lines.reverse();
			for(var i = 0;i<lines.length;i++)//line, i in lines
			{
				if (lines[i].indexOf('<<<') > 0)
				{
					last = lines[i];
					tab_index = lines.length - 1 - i;
					break;
				}
			}	
			if (last.length > 0)
			{ 
				if (last.indexOf('<<<') > 0)
				{
					merge_cell = true;
				}
			}
			lines.reverse();
			if( merge_cell)
			{
				row_span = 0
				row_span1 = 0
				for(var i=0;i<lines.length;i++)//line, i in lines
				{
					if (firstLine)
					{
						if (lines[i].indexOf('\t')<0)
						{
							message+=lines[i]+"<br/>";
							continue;
						}
						message+='<div style="overflow-x:auto;"><table><tbody><tr class="first">';
					}
					else
					{
						message+="<tr>";
					}
					rows = lines[i].split('\t');
					col_span = 0;
					col_j = 0;
					for(var j=0;j<rows.length;j++)//row, j in rows
					{
						var row = rows[j];
						if (i == tab_index)
						{
							row = row.replace("<<<","");
						}
						if (row.length > 0)
						{
							cols = 0;
							j_index = j + 1;
							for(var index_j=0;index_j<rows.length;index_j++)//r, index_j in rows
							{
								var r = rows[index_j];
								if (index_j >= j_index)
								{
									if (i == tab_index)
									{
										r = r.replace("<<<","");
									}
									if (r.length > 0)
									{
										break;
									}
									else
									{
										cols = cols + 1;
									}
								}
							}
							if (cols > 0)
							{
								col_span = cols;
								col_j = j;
								if (row_span1 == 0)
								{
									row_span1 = -1;
								}
								cols = cols + 1;
								if (i == tab_index)
								{
									message += '<td colspan="'+cols+'">'+row.replace("<<<","")+'</td>';
								}
								else
								{
									message += '<td colspan="'+cols+'">'+row+'</td>';
								}
							}
							else
							{
								if (j > 1)
								{
									if (i == tab_index)
									{
										message+="<td>"+row.replace("<<<","")+"</td>";
									}
									else
									{
										message+="<td>"+row+"</td>";
									}
								}
								else
								{
									ro = 0;
									i_index = i + 1;
									for(var index_i=0;index_i<lines.length;index_i++)// ln, index_i in lines
									{
										var ln = lines[index_i];
										if (index_i >= i_index)
										{
											rows_x = ln.split('\t');
											end = false;
											for(var m=0;m<rows_x.length;m++)// r_r, m in rows_x
											{
												var r_r = rows_x[m];
												if (m == j)
												{
													if (i == tab_index)
													{
														r_r = r_r.replace("<<<","");
													}
													if (r_r.length > 0)
													{
														end = true;
														break;
													}
													else
													{
														if (j > 0)
														{
															var t_row = rows_x[j-1];
															if (t_row.length > 0)
															{
																end = true;
																break;
															}
															else
															{
																ro = ro + 1;
															}
														}
														else
														{
															ro = ro + 1;
														}
													}
												}
											}
											if (end)
											{
												break;
											}
										}
									}
									if (ro > 0)
									{
										if (j == 0)
										{
											row_span = ro;
										}
										if (j == 1)
										{
											row_span1 = ro;
										}
										ro = ro + 1;
										if (i == tab_index)
										{
											message += '<td rowspan="'+ro+'" style="text-align:right;vertical-align:middle;">'+row.replace("<<<","")+'</td>';
										}
										else
										{
											message += '<td rowspan="'+ro+'" style="text-align:right;vertical-align:middle;">'+row+'</td>';
										}
									}
									else
									{
										if (i == tab_index)
										{
											message+="<td>"+row.replace("<<<","")+"</td>";
										}
										else
										{
											message+="<td>"+row+"</td>";
										}
									}
								}
							}
						}
						else
						{
							if (j == 0)
							{
								if (row_span == 0)
								{
									message+="<td>"+row+"</td>";
								}
								else
								{
									if (row_span > 0)
									{
										row_span = row_span - 1;
									}
									else
									{
										row_span = 0;
									}
								}
							}
							else if (j == 1)
							{
								if (row_span1 == 0)
								{
									message+="<td>"+row+"</td>";
								}
								else
								{
									if (row_span1 > 0)
									{
										row_span1 = row_span1 - 1;
									}
									else
									{
										row_span1 = 0;
									}
								}
							}
							else
							{
								max_j = col_j + col_span;
								if (j < col_j || j > max_j)
								{
									message+="<td>"+row+"</td>";
								}
							}
						}
						if (j == rows.length - 1)
						{
							if (row_span1 == -1)
							{
								row_span1 = 0;
							}
						}
					}
					message+="</tr>";
					firstLine = false;
				}
				message.html+="</tbody></table></div>";
			}
			else
			{
				for(var i=0;i<lines.length;i++)// lines, (line) ->
				{
					if (firstLine)
					{
					 	if (lines[i].indexOf('\t')<0)
					 	{
					 		message+=lines[i]+"<br/>";
					 		continue;
					 	}
					 	message+='<div style="overflow-x:auto;"><table><tbody><tr class="first">';
					}
					else{
					 	message+="<tr>";
					}
					rows = lines[i].split('\t');
					for(var j=0;j<rows.length;j++)//_.forEach rows, (row) ->
					{
					 	message+="<td>"+rows[j]+"</td>";
					}
					message+="</tr>";
					firstLine = false;
				}
				message+="</tbody></table></div>";
			}
		}
	}
		
	msg = message;
	if(html || msg.match(/\{\{(.*)\}\}/m) || msg.match(/\[\]/gm) || msg.match(/\[[xX]\]/gm) || msg.match(/^\.\d+\s*/m) || msg.match(/^(.*td>)\.\d+\s*/m) || msg.match(/==(\d+)%/gm))
	{
		msg = this._renderEval(msg,todo,html,true);
		//JSON.stringify message
		msg = message.replace (/\n/gm, '<br/>');

		// for mentions editable
		msg = msg.replace (/\{\{(.*)\}\}/m, '$1');

		// for checkbox. TODO: click to edit
		msg = msg.replace (/\[\]/gm, '<input type="checkbox" disabled="disabled"/>');
		msg = msg.replace (/\[[xX]\]/gm, '<input type="checkbox" checked="checked" disabled="disabled"/>');

		// for progress bar
		reg = /==(\d+)%/gm;
		while ((result = reg.exec(msg)) != null)
		{
			if (parseInt(result[1])>=100)
				msg = msg.replace( '=='+result[1]+'%', '<div class="meter nostripes"><span style="width: '+result[1]+'%"><span></span></span></div>'+result[1]+'%');
			else
				msg = msg.replace ('=='+result[1]+'%', '<div class="meter animate"><span style="width: '+result[1]+'%"><span></span></span></div>'+result[1]+'%');
		//msg.html = msg.html.replace /==(\d+)%/gm, '<div class="meter animate"><span style="width: $1%"><span></span></span></div>$1%'#'<progress value="$1%" max="200">$1%</progress>'
		}//*/

		//for marks
		msg = msg.replace (/^\.\d+\s*/m, '');
		msg = msg.replace (/^(.*td>)\.\d+\s*/m, '$1');
		msg = msg.concat('<hr />');
		//console.log('msg');
		//console.log(msg);
		if(urlHTML) msg = this.processURLArray(todo,msg,cur);
		return msg;
	}
	if(!html && urlHTML)
	{
		message = this._renderEval(message,todo,urlHTML,true);
		//console.log('message');
		//console.log(message);
		message = message.replace(/\n/gm,'<br/>');
		if(urlHTML) message = message.concat('<hr />');
		message = this.processURLArray(todo,message,cur);
		return message;
	}
	if(!html)
	{
		var value = message;
  		value = value.replace(/=？/gm,'=?');
  		value = value.replace(/＝？/gm,'=?');
  		value = value.replace(/＝\?/gm,'=?');
  		array = value.split('=?');
  		if(array.length > 1)
  		{
  			message = this._renderEval(message,todo,true,true);
			//console.log('message');
			//console.log(message);
			message = message.replace(/\n/gm,'<br/>');
			if(urlHTML) message = message.concat('<hr />');
			message = this.processURLArray(todo,message,cur);
			return message;
  		}
	}
	return html;
  },
  handleWebDisplay(todo) {
   if(require('react-native').Platform.OS === 'ios')
   {
	let nav = this.props.navigator;
    if (!nav) return;

    let rightButton = null;
  	
    nav.push({
      component: Webview,
      title: ' ',
      leftButton: {
        title: "Back",
        handler: () => nav.pop()
      },
      rightButton: rightButton,
      passProps: {
        url: TodosDB.hostAddress()+this.props.path+'?id='+todo._id,
        html:'',
        imageURL:'',
        update:this,
        urls:[],
        user:{}
      }
    });
    }
    else
    {
    	myClass.open(TodosDB.hostAddress()+this.props.path+'?id='+todo._id);
    }
  },
  handlePress(todo) {
	let nav = this.props.navigator;
    if (!nav) return;
    var url = this._renderImageURL(todo);
	var html = this.processHTML(todo,true);
	if(html)
	{
		//Alert.alert('',html);
		//console.log('chang html');
		//console.log(html);
		if(html.indexOf('<table>') > -1 && html.indexOf('<head>') < 0)
		{
			html = "<head><style>table{margin: 0;padding: 0;font-size: 100%;vertical-align: baseline;border-spacing: 0;border-collapse: collapse;\
						border-top-color: #808080;box-sizing:border-box;border-left: 1px solid #aaa; border-top: 1px solid #aaa;}\
						tr{margin: 0;padding: 0;border: 0;background-color:rgba(160,160,160,0.2);font-size: 100%;vertical-align: baseline;display: table-row;vertical-align: inherit;border-top-color: inherit;border-right-color: inherit;border-bottom-color: inherit;border-left-color: inherit;}\
						td{border-right: 1px solid #aaa;border-bottom: 1px solid #aaa;padding: 2px 4px;margin: 0;font-size: 100%;vertical-align: baseline;display: table-cell;vertical-align: inherit;}\
						</style></head>" + html;
		}
		if(html.indexOf('showInfo(') > -1 && html.indexOf('<script>') < 0)
		{
			html += '<script>function showInfo(t,id,value){var node = t.lastChild;if(node.nodeName == "SPAN"){t.removeChild(node);}else{\
				var span = document.createElement("span");\
				span.setAttribute("style","margin-left:10px;cursor:default;color:gray;");\
				span.innerHTML = value;\
				t.appendChild(span);} \
				return false;}</script>';
		}
		//console.log(html);
		this.props.update.currentClickId(todo._id,todo.msg);
		nav.push({
      		component: Webview,
      		title: ' ',
      		leftButton: {
        		title: "Back",
        		handler: () => nav.pop()
      		},
      		rightButton: {
      			title: "Full Web",
      			handler: () => {this.handleWebDisplay(todo)},
      		},
      		passProps: {
        		url: 'file://',
        		html:'<!DOCTYPE html><html><body>'+html+'</body></html>',
        		imageURL:url,
        		update:this,
        		urls:this.urls,
        		user:this.props.user
      		}
    	});
	}
	else
	{
    	nav.push({
      		component: Detailedview,
      		title: ' ',
      		leftButton: {
        		title: "Back",
        		handler: () => nav.pop()
      		},
      		rightButton: {
      			title: "Full Web",
      			handler: () => {this.handleWebDisplay(todo)},
      		},
      		passProps: {
        		clickImage: this,
        		todo:todo,
        		imageURL:url,
        		user:this.props.user,
        		urls:this.urls
      		}
    	});
    }
  },
  saveImage(url){
  	console.log(url);
  	/*myClass.saveImage(url,(error,result)=>{
  		if(result)
  		{
  			Alert.alert('','Save successfully.');
  		}
  		else
  		{
  			Alert.alert('','Save failed!');
  		}
  	});//*/
  },
  handlePressImage(url) {
	//console.log(url);
	if(!url) return;
	let nav = this.props.navigator;
    if (!nav) return;

    let rightButton = null;
    nav.push({
      component: ImageView,
      title: ' ',
      leftButton: {
        title: "Back",
        handler: () => nav.pop()
      },
      rightButton: rightButton,
      passProps: {
        url: url,
        navigator:this.props.navigator,
        update:this,
        user:this.props.user
      }
    });
  },
  todoNameAndTime(todo)
  {
  	var name = 'undefined';
	if(todo.u) name = todo.u.username;
	var ts = todo.ts;
	var date = new Date(ts);
	year = date.getFullYear();
	month = date.getMonth()+1;
	day = date.getDate();
	hour = date.getHours();
	minute = date.getMinutes();
	if(minute < 10) minute = '0'+minute;
	second = date.getSeconds();
	if(second < 10) second = '0'+second;
	return name + '   ' +year+'-'+month+'-'+day+'  '+hour+':'+minute+':'+second;
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
  _imageView(url)
  {
  	if(require('react-native').Platform.OS === 'ios')
  	{
  		return <ImageView url={url} navigator={this.props.navigator} update={this} user={this.props.user} />;
  	}
  	else
  	{
  		let {Dimensions} = require('react-native');
  		var w = Dimensions.get('window').width;
  		var h = Dimensions.get('window').height;
  		return (<ImageAndroid 
      			source={{uri:url+'?rc_token='+this.props.user.token+'&rc_uid='+this.props.user._id}}
      			style={{width:w,height:h}}
      	/>);
  	}
  },
  _deleteMessage(todo){
  	Alert.alert('','Delete?',[
  		{text:'Cancel'},
  		{text:'Delete',onPress:()=>{TodosDB.deleteTodo(todo)}}]);
  },
  _copyMessage(todo){
  	require('react-native').NativeAppEventEmitter.emit('copymsg',todo.msg);
  	this.props.update.scrollTo();
  },
  toolImage(todo){
  let self = this;
  //console.log(todo._id);
  //console.log(this.props.update.getClickTool());
  if(!this.state.showTool)
  {
  	return(<View style={{flexDirection: 'row'}}>
  	<TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => {this.setState({showTool:true})}}
        	>
  		<Image
  			source={icon}
  			style={{width:20,height:20,marginTop:3,marginLeft:3,tintColor: 'rgba(0, 0, 0, 0.5)'/*,backgroundColor:'rgb(113,236,132)'*/}}
  		/>
  	</TouchableHighlight>
  	</View>
  	);
  	}
  	else
  	{
  		return(<View style={{flexDirection: 'row'}}>
  	<TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => {this.setState({showTool:false})}}
        	>
  		<Image
  			source={icon}
  			style={{width:20,height:20,marginTop:3,marginLeft:3,tintColor: 'rgba(0, 0, 0, 0.5)'/*,backgroundColor:'rgb(13,236,132)'*/}}
  		/>
  	</TouchableHighlight>
  	<TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => {this._deleteMessage(todo)}}
        	>
  		<Image
  			source={trash}
  			style={{width:20,height:20,marginTop:3,marginLeft:3+18,tintColor: 'rgba(0, 0, 0, 0.5)'/*,backgroundColor:'rgb(255,0,0)'*/}}
  		/>
  		</TouchableHighlight>
  		<TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => {this._copyMessage(todo)}}
        	>
  		<Image 
  			source={copy}
  			style={{width:20,height:20,marginTop:3,marginLeft:3+18,tintColor: 'rgba(0, 0, 0, 0.5)'/*,backgroundColor:'rgb(0,255,0)'*/}}
  		/>
  	</TouchableHighlight>
  	</View>);
  	}
  },
  render() {
   let todo = this.props.todo;
	var url = this._renderImageURL(todo);
	if(!todo) return null;
   switch(this.state.pageIndex){
    case 0:
	let textStyle = [];
	var r = this.changeBackgroundColor(todo.msg);
	textStyle.push(styles.row);
    if (r) {
      textStyle.push(styles['mark'+r]);
    }
    return (
      <View key={todo._id}>
      <View style={{flexDirection: 'row'}}>
      	<Text style={{paddingLeft:15,paddingTop:5,fontWeight:'bold'}}>
      		{this.todoNameAndTime(todo)}
      	</Text>
      	{this.toolImage(todo)}
      </View>
      {this.renderImage()}
      	<TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => this.handlePress(todo)}
        	>
        	<View style={textStyle}>
          		{this._showRenderMessage()}
        	</View>
        </TouchableHighlight>
        <View style={styles.border} />
      </View>
    );
    case 1:
     return (
     <View>
     <Modal
     	animationType={'fade'}
     	transparent={true}
     	visible={true}
     	>
     	<View style={{backgroundColor: 'rgb(255, 255, 255)'}}>
    <View>
     	<TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => this.closeModal()/*this.handlePressImage(url)*/}
      >
     	<Text style={{marginTop:20,marginLeft:10,marginBottom:10,fontSize:17,color:'rgb(11,99,252)'}}>{'Close'}</Text>
     </TouchableHighlight>
     </View>
     	{this._imageView(url)}
     </View>
     	</Modal>
     	</View>
     );
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
  	marginLeft:15,
  	marginTop:5,
    width: 100,
    height: 100
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
