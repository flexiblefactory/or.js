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

A computed wraps a function that uses one or more observables or computeds, and executes it whenever one of the observables has a new value set, or one of the computeds gets a new result, caching the result for when it is read.

  - read the value of a computed:
```  
fullName(); //Steven Sanderson
```
 
Computeds are observers that subscribe and unsubscribe automatically, maintaining a subscription to those observables and computeds (their current dependencies) which were read on the last invocation:
```
var male = new or.obs(false);
var title = new or.com(function(){ return male()?'Mr.':'Ms.' ));
```

They are also observables which can be observed by other computeds, allowing us to compose computeds:

```
var titled = new or.com(function(){ return title() + fullName(); ));
male(true); // both title and titled have been recalculated
titled(); // Mr. Steven Sanderson
```



