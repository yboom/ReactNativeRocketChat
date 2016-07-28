let React = require('react-native');
let {AsyncStorage} = React;
let ddpClient = require('./lib/ddpClient');
let _ = require('underscore');

let TodosDB = {};

TodosDB.subscribeToTodos = (listId,timestamp) => {
  if(timestamp)
  {
  	return ddpClient.subscribe('mobileMessages', [listId,timestamp]);
  }
  else
  {
  	return ddpClient.subscribe('mobileMessages', [listId]);
  }
};
TodosDB.unsubscribeToTodos = (listId) => {
  return ddpClient.unsubscribe(listId);
};
TodosDB.connectionError = function(){
	return ddpClient.error;
};
TodosDB.ddpConnection = function(){
	return ddpClient.initialize();
};
TodosDB.ddpClose = function(){
	return ddpClient.close();
};
TodosDB.hostAddress = function(){
//console.log(ddpClient);
	return 'http://'+ddpClient.connection.host+':'+ddpClient.connection.port;
};
TodosDB.observeTodos = (listId, cb,count,timestamp) => {
//console.log("listIdMessage");
  let observer = ddpClient.connection.collections.observe(() => {
    let collection = ddpClient.connection.collections.rocketchat_message;
    if (collection) {
    	//console.log(collection.find({rid: listId,t:null}, {sort: {ts : -1}}));
    	if(count && timestamp)
    	{
      		return collection.find({rid: listId,t:null,ts:{$lt:timestamp}}, {sort: {ts : -1},limit:count});
      	}
      	else if(count && !timestamp)
      	{
      		return collection.find({rid: listId,t:null}, {sort: {ts : -1},limit:count});
      	}
      	else
      	{
      		return collection.find({rid: listId,t:null}, {sort: {ts : -1},limit:count});
      	}
    } else {
      return [];
    }
  });

  observer.subscribe((results) => {
  	console.log('message results----------------');
    cb(results);
  });
};

TodosDB.removeMessage = (todo) => {
	let collection = ddpClient.connection.collections.rocketchat_message;
    if (collection) {
    	return collection.remove({_id:todo._id});
    }
    return 0;
};
TodosDB.addTodos = (todo, rid,u) => {
  let todoObj = {
    rid: rid,
    msg: todo,
    //ts: new Date(),
    u:u
  };

  return ddpClient.call('sendMessage', [todoObj]);
};

TodosDB.addTodo = (todo, rid,u) => {
  let todoObj = {
    rid: rid,
    msg: todo,
    //ts: new Date(),
    u:u
  };

  return ddpClient.call('sendMessage', [todoObj]);
};

TodosDB.deleteTodo = (todo) => {
  return ddpClient.call('deleteMessage', [todo]);
};

module.exports = TodosDB;
