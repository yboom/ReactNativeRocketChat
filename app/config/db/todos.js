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
TodosDB.insertMessage = (todo) => {
	let collection = ddpClient.connection.collections.rocketchat_message;
    if (collection) {
    	let result = ddpClient.connection.collections.rocketchat_message.findOne({_id: todo._id});
    	if(!result)
    	{
    		console.log('insertMessage');
    		//console.log(todo);
    		ddpClient.connection.collections.rocketchat_message.upsert(todo);
    	}
    	else
    	{
    		console.log('no insert message');
    	}
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
TodosDB.uploadFile = (file, rid, user) => {
  
  return ddpClient.call('FileUpload', [file,rid,user]);
  //rocketchat_uploads.files
  //{ "_id" : "YHR3CnZoP54yCeL3J", "filename" : "YHR3CnZoP54yCeL3J", "contentType" : "image/jpeg", "length" : 111160, "chunkSize" : 261120, "uploadDate" : ISODate("2016-07-01T09:06:10.157Z"),
  // "aliases" : null, "metadata" : null, "md5" : "aa85092e72686a1038b5625a3316e547" }
  //rocketchat_uploads
  //{ "_id" : "YHR3CnZoP54yCeL3J", "name" : "yq0KXFXhLRCAdQACAAGyOBWGpVA086.jpg", "size" : 111160, "type" : "image/jpeg", "rid" : "6waYypq42GRWmgXiAmC4gM5hzNg3HnZj9a", "store" : "rocketchat_uploads", 
  //"complete" : true, "extension" : "jpg", "progress" : 1, "uploading" : false, "userId" : "6waYypq42GRWmgXiA", "token" : "dBe84B8b79", "uploadedAt" : ISODate("2016-07-01T09:06:10.173Z"), 
  //"url" : "http://10.0.0.78:3000/ufs/rocketchat_uploads/YHR3CnZoP54yCeL3J/yq0KXFXhLRCAdQACAAGyOBWGpVA086.jpg" }
  //rocketchat_uploads.chunks
  //{ "_id" : ObjectId("57763282079efb270d1c9f7c"), "files_id" : "YHR3CnZoP54yCeL3J", "n" : 0, "data" : BinData(0,"---")}
};
TodosDB.deleteTodo = (todo) => {
  return ddpClient.call('deleteMessage', [todo]);
};

module.exports = TodosDB;
