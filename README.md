# or.js
A minimal implementation of observable and computed functions with no dependencies.

We define two types: 

**observable**...
```
var firstName = new or.obs("Steve"), lastName = new or.obs("Sanderson");
```
...and **computed**:
```
var fullName = new or.com(function(){ return firstName() + ' ' + lastName(); ));
```

**observable**

An observable is a store for any value - be it a primitive, object, array or function...

  - get the value from the observable:
```  
firstName(); //Steve
```
  - set a new value:
```  
firstName("Steven"); //computeds (ie fullname) have already been recalculated when this call returns
```


**computed**

A computed wraps a function that uses one or more observables, and executes it whenever one of these observables has a new value set, caching the result for when the computed is read.
Computeds are observers of observables that subscribe and unsubscribe automatically, maintaining a subscription to those observables (current dependencies) which were read on the last invocation.

  - read the value of a computed:
```  
fullName(); //Steven Sanderson
```

