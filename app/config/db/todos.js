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
  	//console.log('message results----------------');
    cb(results);
  });
};
TodosDB.subscribeToOneTodos = (listId,mid) => {
  return ddpClient.subscribe('mobileMessages', [listId,null,mid]);
};
TodosDB.observeOneTodos = (mid, cb) => {
//console.log("OneMessage");
  let observer = ddpClient.connection.collections.observe(() => {
    let collection = ddpClient.connection.collections.rocketchat_message;
    if (collection) {
    	return collection.findOne({_id: mid});
    } else {
      return null;
    }
  });
  observer.subscribe((result) => {
  //console.log(result);
    cb(result);
  });
};
TodosDB.findOneMessage = (mid) => {
   let connection = ddpClient.connection.collections.rocketchat_message;
   if(connection)
   {
   		let result = ddpClient.connection.collections.rocketchat_message.findOne({_id: mid});
   		if(result)
   		{
			return result;
   		}
   		else
   		{
      		return null;
   		}
   }
   return null;
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
TodosDB.host = function(){
	return ddpClient.connection.host+':'+ddpClient.connection.port;
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
  ddpClient.call('sendMessage', [todoObj]);
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
