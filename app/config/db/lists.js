let React = require('react-native');
let {AsyncStorage} = React;
let ddpClient = require('./lib/ddpClient');

let ListsDB = {};

ListsDB.subscribeToLists = () => {
  return ddpClient.subscribe('publicRooms', [])
    .then(() => {
      return ddpClient.subscribe('group', []);
    });
};
ListsDB.connectionError = function(){
	return ddpClient.error;
}
ListsDB.observeLists = (cb) => {
console.log('Lists');
  	//console.log(ddpClient.connection.collections);
  let observer = ddpClient.connection.collections.observe(() => {
    return ddpClient.connection.collections.rocketchat_room.find();
  });

  observer.subscribe((results) => {
  	AsyncStorage.setItem('room',JSON.stringify(results));
  	
    cb(results);
  });
};

ListsDB.addNewList = (listName) => {
  return ddpClient.call('Lists.insert', [false, listName]);
};

ListsDB.changeListVisibility = (listId, userId) => {
  let mod = {$unset: {userId: true}};

  if (userId) {
    mod = {$set: {userId: userId}};
  }

  return ddpClient.call('Lists.update', [listId, mod]);
};

ListsDB.deleteList = (listId) => {
  let todosColl = ddpClient.connection.collections.todos;
  if (todosColl) {
    let todos = todosColl.find();
    for (var i = 0; i < todos.length; i++) {
      ddpClient.call('Todos.remove', [todos[i]._id]);
    }
  }

  return ddpClient.call('Lists.remove', [listId]);
};

module.exports = ListsDB;
