import or from 'or'
import React from 'react'
import ReactDOM from 'react-dom'
/////////////////////// react hook ////////////////////////

var oconnect=(e,name) =>{
 
  new or.com(()=>{

    //this function will be called when any of render's dependencies change

    if(e.mounted()){

      let ca=e.render();
      const old=e.render;
      e.render = ()=> { e.render = old; return ca };
      e.forceUpdate(); 

      return ca; 

    }

  },"connector for "+e.constructor.name);
 
  return e;
};

var connect = (e,name) =>{
  let oldcdm=e.componentDidMount;
  let oldcwu=e.componentWillUnmount;
  e.componentDidMount = () => {

    if(!e.mounted){
      e.mounted=new or.obs(true,"mounted of "+e.constructor.name);
      oconnect(e,name);
    }
    else(e.mounted(true));
    if(oldcdm)oldcdm();
  };

  e.componentWillUnmount = () => {

    e.mounted(false)
    if(oldcwu)oldcwu();

  };
  e.bound=true;
}


///////////////////// react form components //////////////////

class BoundInput extends React.Component{
  constructor(props){
    super();
    this.state={data:props.value}; 
    
    this.handleChange=(event)=> {
    console.log("handleChange..."); 
    //this.setState({message: event.target.value});
    console.log("will set to "+event.target.value);
  
    this.state.data(event.target.value);
    console.log("done set to "+event.target.value);
  }
  this.render=()=>{
    console.log("render.BoundInput.. ");
    
    var message = this.state.data();
    console.log(message + "    read from.. "+this.state.data.getName());
    
    return <input {...props} type="text" value={message} onChange={this.handleChange} />;
  }
    
    connect(this,props.name);
  } 
}

class BoundCheckbox extends React.Component{
    constructor(props){
    super();
    this.state={data:props.value}; 
    
    this.handleChange=(event)=> {
      this.state.data(event.target.checked);
    };
      
    this.render=()=>{
      return <input {...props} type="checkbox" checked={this.state.data()} onChange={this.handleChange} />;
    };

    connect(this);
  }
}
class BoundRadio extends React.Component{
    constructor(props){
    super();
    this.state={data:props.value}; 
    
      this.handleChange=(event)=> {
         //this.setState({value:event.target.value}); 
       console.log(event.target.value);
       let vals=this.state.data;
       typeof vals == "function" ? vals(event.target.value):this.setState({data:event.target.value});

      };
        
      this.render=()=>{
        let vals=this.state.data;
          let d = typeof vals == "function"?vals():vals;
          return (<label for={props.key}>
          <input id={props.key} {...props} type="radio" value={ d } onChange={this.handleChange} />
          {props.text}
          </label>)
          ;
      };
      connect(this);
  }
}
class BoundSelect extends React.Component  {
  constructor(props){
    super(props);
    this.state={...props};
    console.log(this.state);
    this.render=()=>{
      
      
      let vals=this.state.values;
      let arr= typeof vals == "function"?vals():vals;
      let value = this.state.value();

      return ( <select value={value } onChange={event=>this.state.value(event.target.value)}>
            
                {

                  arr.map(v=>{  
        
                                let vkey = this.props.optionsValue;
                                let val = vkey ? v[vkey]: v;
                                let tkey = this.props.optionsText;
                                let text = tkey ? v[tkey]: v;
                                let tt = typeof text == "function"?text():text;
                                let vv = typeof val == "function"?val():val;
                                let selected = value==vv;
                                return <option selected={selected} value={ vv }>{ tt }</option>;

                             })
                }

              </select>);
      }
      
     
    connect(this);
  }
}
 


class ReactiveComponent extends React.Component{

  constructor(props){
    super(props);
    connect(this);
  };
  shouldComponentUpdate(){
    return false;
  }
  static create(f){
      return (props)=>new (ReactiveComponent.from(f))(props);
  }
  static from(r){
     
     class PureComponent extends ReactiveComponent{
         
         render(){
             return r(this.props);
         }
     }
     return PureComponent;
    
  }
}

export {or, ReactiveComponent, BoundInput, BoundCheckbox, BoundRadio, BoundSelect}