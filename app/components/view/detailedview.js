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
    user:React.PropTypes.object.isRequired
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
  	return value.replace("<<<","");
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