
////////////// observable/computed/reactor ////////////////////////////////// observable/computed/reactor  //////////////////////by tom hatty//hatty//ZOE ORI//hatty//hatty//ZOE ORI


var or=(function(){
  var deps, off, oq, rq, depth=0,
  begin = function(){
    off=true;
    oq=[];
    rq=[];
  },
  abort = function(){
    oq=[];
    rq=[];
    off=false;
  },
  commit = function(){
    Array.from(new Set(oq)).concat(Array.from(new Set(rq))).forEach(f=>f());;
    off=false;
  },
  obs = function(v,name){
    
    //observable
    this.name=name;             
    this.v = v;
    this.submap = new Map();
    this.subs=[];
    this.subscribe = f => {this.unsubscribe(f);this.submap.set(f,this.subs.length);this.subs.push(f);}
    this.unsubscribe = f => this.subs=this.subs.splice(this.submap.get(f),1); //this.subs.filter(ff=>f!=ff);
    let o = (...args) => { 
      if(args.length==0) {
        console.log("getter for "+name);
        if(deps)console.log("pushing "+name+":"+this.v);
        if(deps)deps.push(this);        
        //this observable is now registered as a dependency of the observer being evaluated
        return this.v;
      }
      else{
        console.log("setter for "+name+"..set to: "+ args[0]);
        this.v=args[0];
        console.log(name + " notifying " + this.subs.length + " subscribers of change, new value:"+this.v);

        var observers = this.subs.filter(ss=>ss.lazy).map(o=>s=>o(this.v));
        var reactors = this.subs.filter(ss=>!ss.lazy).map(r=>s=>r(this.v));


        if(off){
          oq=oq.concat(observers);
          rq=rq.concat(reactors);
        }
        else
        {
          const notify = ()=>observers.concat(reactors).forEach(f=>f());
          if(!o.throttle){
            notify();
          }
          else {

            if(!o.tid){  

              notify();
              o.changed = false;
              o.tid = setInterval(()=>{ 
                if(o.changed){
                  notify();
                  o.changed = false;
                }
                else{
                  clearInterval(o.tid);
                  o.tid = null;
                }
                },o.throttle);

            }
            else{
              //throttled! do not notify
              o.changed = true;
            }
          }
        }
      };
    };

    o.reduce = f => o(f(o()));
    o.clone = () => new or.obs(o());
    o.getName=()=>name;
    return o;
  },
  com = function(f,name){
    this.ds=[];
    this.name=name;
    var get = ()=>{
      
      console.log("");
      console.log("");
      console.log("");
      console.log("recomputing "+name);

      //this.inside = true;
      let evaluating = !deps;

      if(evaluating) {

        console.log("");
        console.log(name+ " making deps and unsubscribing");
      
        deps = [];
        this.ds.forEach(d=>{d.unsubscribe(get); });
      }

      this.last = f();
      //now all dependencies have been collected in deps

      if(evaluating){
        this.ds = deps;
        console.log(deps);
        console.log(deps.length+ " deps");
      
        deps = null;
        console.log(name + " subscribing to "+this.ds.length + " dependencies");
        this.ds.forEach(d=>{console.log('\t'+d.name);d.subscribe(get);});   
      }
      console.log("recomputed "+name +" as ");
      console.log(this.last);
      console.log("");
      console.log("");
      //this.inside = false;
    };
    get();
    let c=()=>{

      console.log("reading from computed "+name +".. ");
      
      if(deps){
        deps=deps.concat(this.ds);
        console.log("  adding "+this.ds.length +".. ");
      
      }
      return this.last;
    };
    c.subscribe=()=>this.ds.forEach(d=>d.subscribe(f));
    c.unsubscribe=()=>this.ds.forEach(d=>d.unsubscribe(f));
    c.getName=()=>name;
    return c;
  },
  lazycom = function(f,name){
    this.ds=[];
    this.name=name;

    const goDirty = ()=> {this.dirty = true;}
    goDirty.lazy = true;
    const get = ()=>{
      let evaluating = !deps;

      if(evaluating) {

        console.log("");
        console.log(name+ " making deps and unsubscribing");
      
        deps = [];
        this.ds.forEach(d=>{d.unsubscribe(goDirty); });
      }

      this.last = f();
      //now all dependencies have been collected in deps

      if(evaluating){
        this.ds = deps;
        console.log(deps);
        console.log(deps.length+ " deps");
      
        deps = null;
        console.log(name + " subscribing to "+this.ds.length + " dependencies");
        this.ds.forEach(d=>{console.log('\t'+d.name);d.subscribe(goDirty);});   
      }
     
    };
    goDirty();

    let lc= ()=>{
      if(this.dirty) {

          get();
      }
      else
      {

         if(deps)deps=deps.concat(this.ds);
      }
      //
      return this.last;
    };


    lc.getName = ()=>name;

    lc.subscribe=()=>this.ds.forEach(d=>d.subscribe(f));
    lc.unsubscribe=()=>this.ds.forEach(d=>d.unsubscribe(f));

    return lc;
  }
  ;
  return {obs,com,lazycom,begin,commit};
})();



//export {ReactiveComponent, or, BoundInput, BoundCheckbox, BoundRadio, BoundSelect}
export default or