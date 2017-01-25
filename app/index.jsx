import React from 'react'
import ReactDOM from 'react-dom'
import or from 'or-core'
import {ReactiveComponent, BoundInput, BoundCheckbox, BoundRadio, BoundSelect} from 'react-or-core'

let id=0, store = {},  red = {};
const newTodo = text => { return { id:id++, text:  new or.obs(text,'text'), completed: new or.obs(false,'completed') }};
const TodoItemPure = ({todo,reducers}) => <li key={todo.id} onClick={ e => reducers.toggleTodo(todo)} style={{ textDecoration: todo.completed()?'line-through':'none' }}>{todo.text()}</li>;
const TodoItem = ReactiveComponent.create(TodoItemPure);
const TodoAppPure = ({store,reducers}) => <div>
                                            <BoundInput placeholder="type here" value={store.newTodoText} />
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
red.addTodo = text => store.todos.set(a => [ newTodo(text), ...a ]);
red.toggleTodo = todo =>  todo.completed.set(c => !c);
red.clearTodo = () => store.newTodoText.set(t=>'');
red.changeFilter = k => store.filter.set(f=>store.filters[k]);
or.begin();new Array(10).fill().map((_,i)=>red.addTodo("todo"+i));or.commit();
var e = ReactDOM.render(<div><TodoApp store={store} reducers={red} /></div>, document.getElementById('app'));