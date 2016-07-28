let React = require('react-native');
let {AsyncStorage} = React;
let ddpClient = require('./lib/ddpClient');

let ListsDB = {};

ListsDB.subscribeToLists = () => {
  return ddpClient.subscribe('privateHistory', [])
    .then(() => {
      return ddpClient.subscribe('subscription', []);
    });
};
ListsDB.connectionError = function(){
	return ddpClient.error;
};
ListsDB.observeLists = (cb) => {
	//console.log('Lists');
  	//console.log(ddpClient.connection.collections);
  let observer = ddpClient.connection.collections.observe(() => {
  	let connection = ddpClient.connection.collections.rocketchat_room;
  	if(connection)
  	{
    	return ddpClient.connection.collections.rocketchat_room.find({},{sort:{lm:-1}});
    }
    return [];
  });

  observer.subscribe((results) => {
  	AsyncStorage.setItem('room',JSON.stringify(results));
  	//console.log(results);
  	//console.log('Lists');
    cb(results);
  });
};
ListsDB.Listdetail = (roomid) => {
	//console.log('ListName');
  	//console.log(ddpClient.connection.collections.rocketchat_subscription);
   let connection = ddpClient.connection.collections.rocketchat_subscription;
   if(connection)
   {
   		let results = ddpClient.connection.collections.rocketchat_subscription.findOne({ rid: roomid }, {fields: { name: 1,alert:1,unread:1 } });
   		if(results)
   		{
			return results;
   		}
   }
   return null;
};
ListsDB.SaveListdetail = () => {
   let connection = ddpClient.connection.collections.rocketchat_subscription;
   if(connection)
   {
   		let items = connection.items;
   		let newItems = {};
   		for(var key in items)
   		{
   			let value = items[key];
   			newItems[value.rid] = value;
   		}
   		//console.log(newItems);
   		AsyncStorage.setItem('subscription',JSON.stringify(newItems));
   }
};
ListsDB.addNewList = (listName) => {
  return ddpClient.call('Lists.insert', [false, listName]);
};
ListsDB.readMessages = (listId,userId) => {
  return ddpClient.call('readMessages', [listId, userId]);
};
ListsDB.changeListVisibility = (listId, userId) => {
  let mod = {$unset: {userId: true}};

  if (userId) {
    mod = {$set: {userId: userId}};
  }

  return ddpClient.call('Lists.update', [listId, mod]);
};

ListsDB.deleteList = (listId) => {
  let todosColl = ddpClient.connection.collections.rocketchat_room;
  if (todosColl) {
    let todos = todosColl.find();
    for (var i = 0; i < todos.length; i++) {
      ddpClient.call('Todos.remove', [todos[i]._id]);
    }
  }

  return ddpClient.call('Lists.remove', [listId]);
};

module.exports = ListsDB;
