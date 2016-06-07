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

import Todos from '../todos/todos';
import ListItemAdd from './listItemAdd';
import ListOptions from './listOptions';

import ListsDB from '../../config/db/lists';
import Accounts from '../../config/db/accounts';

import chevronRight from '../../images/fa-chevron-right/fa-chevron-right.png';
import lock from '../../images/fa-lock-icon/lock.png';

export default React.createClass({
  // Configuration
  displayName: 'Lists',

  // Initial Value (State and Props)
  getInitialState() {
    return {
      lists: [],
      user: {}
    }
  },

  // Component Lifecycle
  componentWillMount() {
  	if(ListsDB.connectionError())
  	{
  		AsyncStorage.getItem('room',(error,result)=>{this.setState({lists: JSON.parse(result)});});
  	}
  	else
  	{
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

    Accounts.emitter.on('loggedOut', () => {
      this.setState({user: {}});
    });
  },

  // Event Handlers
  handlePress(list) {
    let nav = this.props.navigator;
    let {user} = this.state;

    if (!nav) return;

    let rightButton = null;/*(
      <ListOptions
        navigator={nav}
        list={list}
        user={user}
        />
    );//*/
    let title = list.name;
	if(list.t == 'd')
  	{
  		var usernames = list.usernames;
  		title = '@ '+usernames[1];
  	}
  	
    nav.push({
      component: Todos,
      title: title,
      leftButton: {
        title: "Back",
        handler: () => nav.pop()
      },
      rightButton: rightButton,
      passProps: {
        listId: list._id
      }
    });
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
  	if(list.t == 'd')
  	{
  		var usernames = list.usernames;
  		return (
  			<Text>{'@ '+usernames[1]}</Text>
  		);
  	}
  	else
  	{
  		return (
  			<Text>{list.name}</Text>
  		);
  		
  	}
  },
  // Sub-render
  renderItems() {
  	if(!this.state.lists) return null;
    return this.state.lists.map((list, i) => {
      return (
        <View key={list._id}>
          <TouchableHighlight
            underlayColor='rgba(0, 0, 0, 0.1)'
            onPress={() => this.handlePress(list)}
            >
            <View style={styles.row}>
              <View style={styles.incomplete}>
                <Text style={styles.incompleteText}>{list.msgs}</Text>
              </View>
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
  //<ListItemAdd />
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
