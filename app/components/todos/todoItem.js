import React, {
  StyleSheet,
  View,
  Text,
  PixelRatio,
  Image,
  TouchableOpacity,
  ListView,
  ScrollView,
} from 'react-native';

import openSquare from '../../images/fa-square-o/fa-square-o.png';
import checkedSquare from '../../images/fa-check-square-o/fa-check-square-o.png';
import trash from '../../images/fa-trash-o/fa-trash-o.png';

import TodosDB from '../../config/db/todos';

export default React.createClass({
  // Configuration
  displayName: 'Todo Item',
  propTypes: {
    todo: React.PropTypes.object.isRequired
  },
  // Sub-render
  renderDelete() {
    let todo = this.props.todo;

    if (todo.checked) {
      let trashIcon = trash;
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={() => TodosDB.deleteTodo(todo)}
        >
          <Image
            source={trashIcon}
            style={styles.rightIcon}
            />
        </TouchableOpacity>
      );
    }
  },

  renderAction() {
    let todo = this.props.todo;

    let actionIcon = openSquare;
    if (todo.checked) {
      actionIcon = checkedSquare;
    }

    return (
      <TouchableOpacity
        onPress={() => TodosDB.changeTodoState(todo, !todo.checked)}
      >
        <Image
          source={actionIcon}
          style={styles.leftIcon}
          />
      </TouchableOpacity>
    );
  },
  
  renderImage() {
    let todo = this.props.todo;
	let file = todo.attachments;
	if(file && file.length > 0)
	{
		//console.log(todo.attachments);'http://img1b.xgo-img.com.cn/pics/2783/a2782717.jpg'
		let address = TodosDB.hostAddress();
		let att = file[0];
		console.log(TodosDB.hostAddress()+att.image_url);
    	return (
        	<Image
          	source={{uri:TodosDB.hostAddress()+att.image_url}}
          	style={styles.image}
          	onLoadStart = {()=>{console.log('begin image')}}
          	onLoadEnd={(error)=>{console.log(error)}}
          />
    	);
    }
    return null;
  },
  _renderText(text)
  {
  		if(text.length <= 0)
  		{
  			return '  ';
  		}
  		return text;
  },
  _renderRow(rowData)
  {
  	//console.log(rowData)
  	return rowData.map((row) =>{
  		return (<View style = {styles.cellView}>
                <Text>{this._renderText(row)}</Text>
        </View>);
    });
  },
  _rightRenderRow (rowData, sectionID, rowID){
    return (
    	<View style = {{flexDirection:'row'}}>
            {this._renderRow(rowData)}
        </View>
    );
  },
  _showRenderMessage(){
  	let todo = this.props.todo;
  	let textStyle = [];
    if (todo.checked) {
      textStyle.push(styles.textChecked);
    }
  	if(todo.msg.split('\t').length > 2)
    {
        var row = todo.msg.split('\n');
        var column = [];
        for(var i=0;i<row.length;i++)
        {
        	var data = row[i].split('\t');
        	 column.push(data);
        }
        //console.log(row);
        //console.log(column);//onScroll={this.onScroll2}
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); 
    
        //this.setState({scrollViewDataSource: this.state.scrollViewDataSource.cloneWithRows(column)});
        return(
        <View style = {{flex:3}}>
           <ScrollView style = {{flex: 1,marginRight:1,marginLeft:1,marginTop:0,marginBottom:1,flexDirection: 'column'}}
                       bounces = {false}
                       showsHorizontalScrollIndicator = {true}
                       showsVerticalScrollIndicator = {true}
                       horizontal = {true}>
                       <View style = {{height:280,flexDirection: 'column'}}>

                       <ListView
                        showsHorizontalScrollIndicator = {false}
                        showsVerticalScrollIndicator = {false}
                        // bounces = {false}
                        // scrollEventThrottle={1000}
                        style = {{flex: 1}}
                        dataSource = {ds.cloneWithRows(column)}
                        renderRow = {this._rightRenderRow}
                       />
                       </View>
           </ScrollView>
        </View>
        );
    }
    else//*/
    {
    	return (
    		<Text style={textStyle}>
            	{todo.msg}
          	</Text>
        );
    }
  },
  // Component Render
  render() {
    let todo = this.props.todo;
////{this.renderDelete()} //{this.renderAction()}
    return (
      <View key={todo._id}>
      {this.renderImage()}
        <View style={styles.row}>
          
          {this._showRenderMessage()}
          
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
  	marginLeft:15,
    width: 100,
    height: 100
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
  cellView: {
    height:50,
    borderColor: '#DCD7CD',
    borderRightWidth:1,
    borderBottomWidth:1,
    alignItems: 'center',      // 水平局中
    justifyContent: 'center',  // 垂直居中
  }
});
