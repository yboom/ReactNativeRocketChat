import React, {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  PixelRatio,
  Image,
} from 'react-native';
let {AsyncStorage} = React;//require('react-native');;
let _ = require("underscore");

import Accounts from '../../config/db/accounts';
import openSquare from '../../images/fa-square-o/fa-square-o.png';
import checkedSquare from '../../images/fa-check-square-o/fa-check-square-o.png';

export default React.createClass({
  // Configuration
  displayName: 'Detailedview',
  propTypes: {
    clickImage: React.PropTypes.object.isRequired,
    todo: React.PropTypes.object.isRequired,
    imageURL:React.PropTypes.string,
    user:React.PropTypes.object.isRequired,
    urls:React.PropTypes.array.isRequired
  },

  // Initial Value (State and Props)
  getInitialState() {
    return {
      user: {},
    };
  },

  // Component Lifecycle
  componentWillMount() {
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
  			var chart = string.substring(string.length-j-1,string.length-j);
  			if(!isNaN(chart) && chart != ' ' && j<string.length-1) continue;
  			if(chart == ':' || chart == '：')
  			{
  				var str = string.substring(0,string.length-j-1);
  				//console.log(str);
  				str = str.replace(/（/gm,'(');
  				var right = str.lastIndexOf('(');
  				chart = '(';
  				var l = str.length - right;
  				//console.log(l);
  				j = j+l;
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
  			if((cal.indexOf(chart) == -1) || (cal.indexOf(chart) > -1 && j == string.length-1))
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
  _sumEval(message,column)
  {
	s = 0
	if( message.urls && message.urls.length > 0)
	{
		for(var i=0;i<message.urls.length;i++)
		{	
			var url = message.urls[i];		
			if (!url || !url.meta || !url.meta.msg || !url.meta.msg.msg)
			{
				continue;
			}
			var value = url.meta.msg.msg;
			var string = value.replace(/=？/gm,'=?');
			string = string.replace(/＝？/gm,'=?');
			string = string.replace(/＝\?/gm,'=?');
			var  array = string.split("=?");
			if (array.length >= column)
			{
				s_value = array[column-1];
				if (s_value.length == 0)
				{
					return 0;
				}
				else
				{
					var str_value = s_value.replace(/（/gm,'(');
					str_value = str_value.replace(/）/gm,')');
					var sumArray = str_value.split("sum(");
					if(sumArray.length > 1)
					{
						for (var j=0; j<sumArray.length;j++)
						{
							var str = sumArray[j];
							if(j == 0 )
								continue
							var index = str.indexOf(')');
							var v = this._sumEval(url.meta.msg,str.substring(0,index));
							s_value = s_value.replace('sum('+str.substring(0, index)+')',v);
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
  _renderEval(value)
  {
  	var result = '';
  	console.log(value);
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
         if (sumArray.length > 1) {                                                                            
            for (j = o = 0, len1 = sumArray.length; o < len1; j = ++o) {                                         
              str = sumArray[j];                                                                                 
              if (j === 0) {                                                                                     
                continue;                                                                                       
              }                                                                                                  
              index = str.indexOf(')');                                                                          
              v = this._sumEval(this.props.todo, str.substring(0, index));                                                        
              str_sum = 'sum(' + str.substring(0, index) + ')';                                                  
              str_value = str_value.replace(str_sum, v);                                                         
            }                                                                                                    
          }                                                                                                      
          str = this._Eval(str_value, true);                                                                          
          result += string + '=' + str;
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
  		return this._renderEval(array);
  	}
  	else
  	{
  		return s.replace("<<<","");
  	}
  },
  renderImage() {
	if(this.props.imageURL)
	{
		if(require('react-native').Platform.OS === 'ios')
		{
			return (<Image
          		source={{uri:this.props.imageURL}}
          		style={styles.image}
        	/>);
        }
        else
        {
        	return (<Image
          		source={{uri:this.props.imageURL+'?rc_token='+this.props.user.token+'&rc_uid='+this.props.user._id}}
          		style={styles.image}
        	/>);
        }
    }
    return null;
  },
  _showRenderMessage(){
  	let todo = this.props.todo;
  	let textStyle = [];
    if (todo.checked) {
      textStyle.push(styles.textChecked);
    }
  	var array = this._renderProcessString(todo.msg);
    return array.map((value,i)=>{
        return (<Text key={i} style={textStyle}>
        	{this._renderType(value)}
        </Text>);
    });
    // /\[\]/gm
    // /\[[xX]\]/gm
  },
  // Component Render
  render() {
  //console.log(this.props.url);
  //<Text style={{fontSize:17}}>{this.props.todo.msg}</Text>
    return (
      <ScrollView>
      <TouchableHighlight
      		underlayColor='rgba(0, 0, 0, 0)'
        	onPress={() => {
        		if(require('react-native').Platform.OS === 'ios')
        		{
        			this.props.clickImage.replaceScene();
        		}
        		else
        		{
        			this.props.clickImage.handlePressImage(this.props.imageURL);
        		}
        	}}
      >
        <View>
      		{this.renderImage()}
		</View>
      </TouchableHighlight>
      <View>
      	{this._showRenderMessage()}
      </View>
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
  leftIcon: {
    marginRight: 10,
    tintColor: 'rgba(0, 0, 0, 0.25)'
  },
  image: {
  	marginLeft:10,
  	marginTop:3,
  	marginBottom:3,
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