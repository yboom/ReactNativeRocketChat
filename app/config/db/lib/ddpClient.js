let DDPClient = require("ddp-client");
let _ = require("underscore");
let {AsyncStorage} = require("react-native");
let {Platform} = require("react-native");

var myClass = require("NativeModules").MyClass;
let ip = "54.222.159.156";
if(Platform.OS === 'ios')
{
	ip = myClass.address;
}
//console.log(myClass.address);
let ddpClient = new DDPClient({
  // All properties optional, defaults shown
  host : ip,//"52.77.199.26",//10.0.0.78
  port : 3000,
  ssl  : false,
  autoReconnect : true,
  autoReconnectTimer : 500,
  maintainCollections : true,
  ddpVersion : '1',  // ['1', 'pre2', 'pre1'] available
  // Use a full url instead of a set of `host`, `port` and `ssl`
  // url: 'wss://example.com/websocket'
  // socketConstructor: WebSocket // Another constructor to create new WebSockets
});

let ddp = {};
ddp.connection = ddpClient;
ddp.error = false;

ddp.initialize = () => {
  return new Promise(function(resolve, reject) {
    ddpClient.connect(function(error, wasReconnect) {
      // If autoReconnect is true, this back will be invoked each time
      // a server connection is re-established
      if (error) {
        console.log(`DDP connection error! Attempted to connect to ${ddpClient.host}:${ddpClient.port}`);
        reject(error);
        ddp.error = true;
      }
	  else
	  {
	  	ddp.error = false;
	  }
      if (wasReconnect) {
        console.log('Reestablishment of a connection.');
        require('react-native').NativeAppEventEmitter.emit('reconnection','');
      }

      console.log('connected!');
      resolve(true);
    });
  });
};

ddp.close = function() {
	console.log('ddpClient close');
  return ddpClient.close();
};

ddp.subscribe = function(pubName, params) {
  params = params || undefined;
  if (params && !_.isArray(params)) {
    console.warn('Params must be passed as an array to ddp.subscribe');
  }
  return new Promise(function(resolve, reject) {
    ddpClient.subscribe(pubName, params, function () {
      resolve(true);
    });
  });
};

ddp.unsubscribe = function(params) {
  params = params || undefined;
  if (params) {
    console.warn('Params must be passed as an array to ddp.subscribe');
  }
  return new Promise(function(resolve, reject) {
    ddpClient.unsubscribe(params);
  });
};

ddp.call = function(methodName, params) {
  params = params || undefined;
  if (params && !_.isArray(params)) {
    console.warn('Params must be passed as an array to ddp.call');
  }
	
  return new Promise(function(resolve, reject) {
  	function processStorage(todo)
	{
		AsyncStorage.getItem('messageSAE'+todo.rid,(error,result)=>{
			var results = {};
  			if(result)
  			{
  				var message = JSON.parse(result);
  				var infos = [];
  				if(message.info && message.info.length > 0) 
  				{
  					var info = message.info;
  					for(var i=0;i<info.length;i++)
  					{
  						var inf = info[i];
  						if(inf.msg != todo.msg)
  						{
  							infos.push(inf);
  						}
  					}
  				}
  				if(message.error && message.error.length > 0)
  				{
  					var errors = message.error;
  					var exists = false;
  					for(var i=0;i<errors.length;i++)
  					{
  						let err = errors[i];
  						if(err.msg == todo.msg)
  						{
  							exists = true;
  						}
  					}
  					if(!exists) errors.push(todo);
  					results.info = infos;
  					results.error= errors;
  				}
  				else
  				{
  					var errors = [];
  					errors.push(todo);
  					results.info = infos;
  					results.error= errors;
  				}
  			}
  			else
  			{
  				var errors = [];
  				errors.push(todo);
  				results.error= errors;
  			}
  			AsyncStorage.setItem('messageSAE'+todo.rid,JSON.stringify(results),(error)=>{
  				require('react-native').Alert.alert('error',todo.error,[{text:'Close',onPress:()=>{require('react-native').NativeAppEventEmitter.emit('Sendfailed','');}}]);
  			});
  		});
	}
    ddpClient.call(methodName, params,
      function (err, result) {   // callback which returns the method call results
        // console.log('called function, result: ' + result);
        //console.log(result);
        if (err) {
          reject(err);
          if(methodName == 'sendMessage')
          {
          	var todo = params[0];
          	todo.code = err.error;
          	todo.error = err.reason.replace('[methods] '+methodName+' -> ','');
          	//console.log(todo);
            processStorage(todo);
  		  }
        } else {
          resolve(result);
          console.log(result);
          if(methodName == 'sendMessage')
          {
          	require('react-native').NativeAppEventEmitter.emit('Sendsuccess',result);
          }
          else if(methodName == 'deleteMessage')
          {
          	if(result) 
          	{
          		require('react-native').NativeAppEventEmitter.emit('deleteMessage',params[0]);
          	}
          }
        }
      },
      function () {              // callback which fires when server has finished
        // console.log('updated');  // sending any updated documents as a result of
        // console.log(ddpclient.collections.posts);  // calling this method
      }
    );
  });
};

module.exports = ddp;
