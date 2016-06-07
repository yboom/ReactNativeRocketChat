import React, {
  StyleSheet,
  View,
  TextInput,
  Image,
  PixelRatio,
  AlertIOS
} from 'react-native';

import addIcon from '../../images/fa-plus-circle/fa-plus-circle.png';

import TodosDB from '../../config/db/todos';
import Accounts from '../../config/db/accounts';

export default React.createClass({
  // Configuration
  displayName: 'Todo Item Add',
  propTypes: {
    listId: React.PropTypes.string
  },

  // Initial State
  getInitialState() {
    return {
      message: '',
      user:{}
    }
  },
    componentWillMount() {
    Accounts.userId.then((userId)=>{
    	if(userId){
    		this.setState({user:{_id:userId}});
    	}
    	Accounts.userName.then((userName)=>{
  			if(userName)
  			{
  				this.setState({user:{_id:this.state.user._id,name:userName}});
  			}
  		});
    });
    },
  // Event Handlers
  handleSubmit() {
  	//AlertIOS.alert('',this.state.user._id+'133'+this.state.user.name);
  	if(Object.keys(Accounts.userId).length <= 0)
  	{
  		AlertIOS.alert('','Please login');
  		return;
  	}
  	if(!this.state.message.length)
  	{
  		AlertIOS.alert('','Input information');
  		return;
  	}
    if (this.state.message.length) {
      let u = {_id:this.state.user._id,username:this.state.user.name};
      TodosDB.addTodo(this.state.message, this.props.listId,u);
      this.setState({message: ''});
      this.refs.input.clear();
    }
  },

  // Component Render
  render() {
    return (
      <View>
        <View style={styles.row}>
          <Image
            source={addIcon}
            style={styles.icon}
            />
          <TextInput
            ref='input'
            style={styles.input}
            placeholder="Send new message"
            onSubmitEditing={this.handleSubmit}
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
    height: 20
  },
  icon: {
    marginRight: 10,
    tintColor: 'rgba(0, 0, 0, 0.25)'
  },
  border: {
    height: 1 / PixelRatio.get(),
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
});
