let React = require('react-native');
let {AsyncStorage} = React;
let ddpClient = require('./lib/ddpClient');
let _ = require('underscore');

let TodosDB = {};

TodosDB.subscribeToTodos = (listId) => {
  return ddpClient.subscribe('mobileMessages', [listId]);
};
TodosDB.connectionError = function(){
	return ddpClient.error;
}
TodosDB.hostAddress = function(){
//console.log(ddpClient);
	return 'http://'+ddpClient.connection.host+':'+ddpClient.connection.port;
}

TodosDB.observeTodos = (listId, cb) => {
console.log("listIdMessage");
  let observer = ddpClient.connection.collections.observe(() => {
    let collection = ddpClient.connection.collections.rocketchat_message;
    if (collection) {
    	//console.log(collection.find({rid: listId,t:null}, {sort: {ts : -1}}));
      return collection.find({rid: listId,t:null}, {sort: {ts : -1}});
    } else {
      return [];
    }
  });

  observer.subscribe((results) => {
  	AsyncStorage.setItem('message'+listId,JSON.stringify(results));
  	//console.log('subscribe results----------------');
    cb(results);
  });
};

// TodosDB.getTodos = (listId) => {
//   return new Promise(function (resolve, reject){
//     resolve(ddpClient.connection.collections.todos.find({listId: listId}));
//   });
// };

TodosDB.addTodo = (todo, rid,u) => {
  let todoObj = {
    rid: rid,
    msg: todo,
    ts: new Date(),
    u:u
  };

  let listMod = {
    $inc: {msgs: 1}
  };

  return ddpClient.call('sendMessage', [todoObj]);
};

TodosDB.deleteTodo = (todo) => {
  return ddpClient.call('deleteMessage', [todo._id]);
};

TodosDB.changeTodoState = (todo, checked) => {
  let todoMod = {$set: {checked: checked}};
  let listMod = {$inc: {incompleteCount: checked ? -1 : 1}};

  return ddpClient.call('Todos.update', [todo._id, todoMod])
    .then(() => {
      return ddpClient.call('Lists.update', [todo.listId, listMod]);
    });
};

module.exports = TodosDB;
