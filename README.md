# or.js

or - ko style dependency tracking, without code dependencies: 'Just the dependency tracking'

or is a minimal implementation of the the observer-observable pattern with automatic dependency tracking; that is, observers subscribe and unsubscribe automatically, maintaining a subscription to those observables (their current dependencies) which were read on the last invocation. It aims to be easy to understand and offer a minimal yet complete API.

Or is built around observables, these are simply (function) objects that hold a value.

Observers are functions that use observables - these are evaluated lazily.

Reactive observers (reactors!) are functions that use observables and have side effects. They are evaluated immediately when an observable dependency changes.

Both types of observer are also observable - observed by other observers.

When the value held by the observable is changed, first we mark our lazy observers dirty, then we execute reactors.

Observers refresh their dependencies whenever they execute, maintaining a minimal set of subscriptions.

Or.js could be used with any view library; bindings are provided for react, see react-or below:


# Documentation

We define three types: 

**observable**...
```
var firstName = new or.obs("Zoe"), lastName = new or.obs("Sparkle");
```

**lazy observer**...
```
var firstName = new or.lazycom("Zoe"), lastName = new or.lazycom("Sparkle");
```

...and **reactive observer (reactor)**:
```
var fullName = new or.com(function(){ return firstName() + ' ' + lastName(); ));
```


**observable**

An observable is a store for any value - be it a primitive, object, array or function...

  - get the value from the observable:
```  
firstName(); //Zoe
```
  - set a new value:
```  
firstName("Leopard"); //reactors (ie fullname) have already been recalculated when this call returns
```


**lazy observer**

A lazy wraps a function that uses one or more observables, and holds a cached result returned from this function. Whenever one of the observables has a new value set, the cache is invalidated.

  - read the value of a lazy:
```  
fullName(); //Leopard Sparkle
```

Lazy observers are evaluated lazily and should be created with pure functions (no side effects).

**reactive observer**

A reactive wraps a function that uses one or more observables, and executes it whenever one of the observables it depends on has a new value set, caching the result for when it is read.
 
Lazy and reactive observers subscribe and unsubscribe automatically, maintaining a subscription to those observables (their current dependencies) which were read on the last invocation:
```
var mr = new or.obs('Mr.');
var ms = new or.obs('Ms.');
var male = new or.obs(false);
var title = new or.com(function(){ return male()? mr():ms() ));

//currently title depends on male and ms 

male(true); // both title and titled have been recalculated and so have their dependencies.

//now title depends on male and mr 
```

They are also observables which can be observed by other observers, allowing us to compose observers:

```
var titled = new or.com(function(){ return title() + fullName(); ));

titled(); // Mr. Leopard Sparkle
```

While the reactive observer is essential for binding to a UI (see react-or, below), most use cases for observers can use the lazy implementation.

# Transactions

To prevent any evaluation from occuring during a batch of updates, it is posssible to batch a series of updates and then commit them.

```
or.begin();
firstName("Boo");
lastName("Boo");
or.commit();
```

# Throttling

```
To prevent an observable from notifying its observers too frequently:

o.throttle = 100 ; //100 ms
```


# react-or.js

react-or - ko style data binding for react

**react-or** provides the hooks for **or** to be used with **react**. 

By hooking in to react's 'componentDidMount' and 'componentWillUnmount' we track which components are mounted and only these components react to changes.

UI updates happen automatically at the highest possible granularity, because all components are rendered if and only if the data they -directly- display changes.

Create a reactive component from a function:

```
ReactiveComponent.create(TodoAppPure);
```

React-or also provides input, checkbox, radio and select components ready to be used with react and or:

**BoundSelect**

```
  let values = [{name:'boo',id:1},{name:'foo',id:2}];
  let selected = values[0]; 
<BoundSelect values={values} value={selected} optionsText="name" optionsValue="id"/>
```

**BoundRadio**

```
<BoundRadio value={foo()} />
```

**BoundCheckbox**

```
<BoundCheckbox value={foo()} />
```

**BoundInput**

```
<BoundInput value={foo()} />
```

#Example todo app

```

import React from 'react'
import ReactDOM from 'react-dom'
import or from 'or'
import {ReactiveComponent, BoundInput, BoundCheckbox, BoundRadio, BoundSelect} from 'react-or'

let id=0, store = {},  red = {};
const newTodo = text => { return { id:id++, text:  new or.obs(text,'text'), completed: new or.obs(false,'completed') }};
const TodoItemPure = ({todo,reducers}) => <li key={todo.id} onClick={ e => reducers.toggleTodo(todo)} style={{ textDecoration: todo.completed()?'line-through':'none' }}>{todo.text()}</li>;
const TodoItem = ReactiveComponent.create(TodoItemPure);
const TodoAppPure = ({store,reducers}) => <div>
                                            <BoundInput placeholder="type here" ds={store.newTodoText} />
                                            <button onClick={e => {reducers.addTodo(store.newTodoText());reducers.clearTodo();}}> + </button>
                                            { Object.keys(store.filters).map( k => <a key={k} onClick={ e=> reducers.changeFilter(k) } href="#"> {k} </a>  ) }
                                            <ul> {store.filteredTodos().map( todo => <TodoItem {...{todo,reducers,key:todo.id}} />)} </ul>
                                          </div> ;
const TodoApp = ReactiveComponent.create(TodoAppPure);
store.newTodoText =  new or.obs("","newTodoText");
store.todos = new or.obs([],"todos");
store.filters = {'Show All': t => true, 'Show Completed': t => t.completed(), 'Show Pending': t => !t.completed() };
store.filter = new or.obs(store.filters['Show All'],"filter");
store.filteredTodos = new or.lazycom(() =>store.todos().filter(store.filter()),"filteredTodos");
red.addTodo = text => store.todos.reduce(a => [ newTodo(text), ...a ]);
red.toggleTodo = todo =>  todo.completed.reduce(c => !c);
red.clearTodo = () => store.newTodoText.reduce(t=>'');
red.changeFilter = k => store.filter.reduce(f=>store.filters[k]);
or.begin();new Array(10).fill().map((_,i)=>red.addTodo("todo"+i));or.commit();
var e = ReactDOM.render(<div><TodoApp store={store} reducers={red} /></div>, document.getElementById('app'));


```