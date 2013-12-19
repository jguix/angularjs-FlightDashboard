### Introduction

Promises are a great solution to address complexities of asynchronous requests and responses. AngularJS provides Promises using services such as `$q` and `$http`; other services also use promises, but I will not discuss those here.

Promises allow developers to easily attach *1x-only notifications of response* to any asynchronous request/action. Promises also enable two (2) other very important things. We can:

*  Transform the responses before subsequent handlers (in the chain) are notified of the response.
*  Use the response to invoke more async requests (which could generate more promises).

But even more important than the features above, Promises support easy **chaining** of custom activity or computations. Managing sequences or chains of asynchronous activity can be a very difficult and complex effort. Promise chains are **amazing** and provide means to easily build sequences of asynchronous requests or asynchronous activity. 

>
...and we will also discuss the some of hidden anti-patterns

Below I explore and discuss the hidden power in chain promises. Or your can simply watch the [Egghead.io Video Tutorial](http://egghead.io/lessons/angularjs-chained-promises):

![chaining-promises video](https://f.cloud.github.com/assets/210413/1779100/787e1fb6-6840-11e3-8f87-2f8a3a1aaee0.jpg)

---

### The FlightDashboard

Consider the Travel Service shown which loads information about the user's upcoming travel departure. Below our *service* shows how a a remote web service by returns a JSON data file... Remember that data calls are asynchronous and our TravelService request generates **a promise to respond** when the information is loaded.

```javascript
var TravelService = function( $http )
	{
		return {

			getDeparture : function( user )
			{
				return $http.get (
					URL_LAST_FLIGHT,
					{ userID : user.email }
				);
			}
		};
	}
```

Now let's use this service from a `FlightDashboard` to load the user's scheduled flight:

```javascript
var FlightDashboard = function( $scope, user, travelService )
	{
		travelService
			.getDeparture( user )
			.then( function( departure )
			{
				// Publish the departure details to the view
				$scope.departure = departure;
			});

		$scope.departure = null;
	};
```

>
Okay this is nice... but nothing shockingly new is shown here. So let's add some `real-world` complexity. 

---

### Nesting Promise Chains

Now let's assume that once we have flight details, then we will also want to check the weather forecast and the flight status. 

The scenario here is a cascaded 3-call sequence:  `getDeparture()` -> `getFlight()` -> `getForecast()`

![sequential chaining](https://f.cloud.github.com/assets/210413/1777753/2e351326-682a-11e3-844a-d3583486f558.jpg)


```javascript
var FlightDashboard = function( $scope, user, travelService, weatherService )
    {
        // Level 1
        travelService
            .getDeparture( user.email )                 // Request #1
            .then( function( departure )                // Response Handler #1
            {
                $scope.departure = departure;

                // Level 2
                travelService
                    .getFlight( departure.flightID )        // Request #2
                    .then( function( flight  )              // Response Handler #2
                    {
                        $scope.flight = flight;

                        // Level 3
                        weatherService
                            .getForecast( departure.date )      // Request #3
                            .then( function( weather )          // Response Handler #3
                            {
                                $scope.weather = weather;
                            });
                    });
            });


    };
```

Notice how the success handler for getFlight() is passed the flight object. And the success handler for getForecast() is passed the weather object... both of which are published to the scope.


The above implementation uses deep-nesting to create a sequential, cascading chain of three (3) asynchronous requests; requests to load the user's depature, flight information, and weather forecast. 

>
Note that the code shown above does NOT handle errors. And any nested rejections will not be propogated properly.

---

### Flattened Promise Chains

While this works, deep nesting can quickly become difficult to manage if each level has non-trivial logic. Promise chain nesting also requires developers to careful consider how they will manage errors within the chain segments.

I personally consider deep nesting to be an **anti-pattern**. Fortunately we can restructure the code for errors, clarity, and maintenance. Here we leverage the fact that a promise handler can return:

*  A value - that will be delivered to subsequent resolve handlers
*  A **promise** - that will create a branch queue of async activity
*  A exception - to reject sebsequent promise activity
*  A rejected promise - to propogate rejections to subsequent handlers

Since promise handlers can **return Promises**, let's use that technique to refactor a new implementation:

```javascript
var FlightDashboard = function( $scope, user, flightService, weatherService )
    {
        travelService
            .getDeparture( user )                                           // Request #1
            .then( function( departure )
            {
                $scope.departure = departure;                               // Response Handler #1
                return travelService.getFlight( departure.flightID );       // Request #2
 
            })
            .then( function( flight )
            {
                $scope.flight = flight;                                     // Response Handler #2
                return weatherService.getForecast( $scope.departure.date ); // Reqeust #3
            })
            .then( function( weather )
            {
                $scope.weather = weather;                                   // Response Handler #3
            });
 
        $scope.flight     = null;
        $scope.planStatus = null;
        $scope.forecast   = null;
    };
```

The important change here is to notice that the reponse handler **returns** a Promise. See how the handler for `getDeparture()` returns a promise for `getFlight()`? And the success handler for `getFlight()` which returns a promise for `getForecast()`. 

>
Remember that success handlers can either (a) return the response value, (b) throw an exception, or (c) return a **Promise**

This is a good example of a flattened **promise chain** approach. But I do not like this solution because I had to create my **success** handlers as function wrappers that essentially only call another promise-returning API. It would be great if I could eliminate those *tedious* function wrappers... which seem like an unnecessary, extra layers!

>
This is also manifest at least two other anti-patterns:
*  we modified a $scope variable at each level; instead of a single-pass modification of all three (3) $scope variables.
*  `getForecast()` call references `$scope.departure.date` instead of an *argument-passed reference*.

---

### Better Refactors

What else can we do? What if we viewed each request-response as a self-contained process? Then we could chain processes...

```javascript
    var FlightDashboard = function( $scope, user, travelService, weatherService )
        {
            var loadDeparture = function( user )
                {
                    return travelService
                            .getDeparture( user.email )                     // Request #1
                            .then( function( departure )
                            {
                                $scope.departure = departure;               // Response Handler #1
                                return departure.flightID;
                            });
                },
                loadFlight = function( flightID)
                {
                    return travelService
                            .getFlight( flightID )                          // Request #2
                            .then( function( flight )
                            {
                                $scope.flight = flight;                     // Response Handler #2
                                return flight;
                            });
                },
                loadForecast = function()
                {
                    return weatherService
                            .getForecast( $scope.departure.date )           // Reqeust #3
                            .then(function( weather )
                            {
                                $scope.weather = weather;                   // Response Handler #3
                                return weather;
                            });
                };


            // 3-easy steps to load all of our information...

            loadDeparture( user )
                .then( loadFlight )
                .then( loadForecast );


            $scope.user       = user;
            $scope.departure  = null;
            $scope.flight     = null;
            $scope.weather    = null;

        };
```

Now we have three (3) intuitively-named functions: `loadDeparture()`, `loadFlight()`, and `loadForecast()`… all chained together in a flat chain; each segment of the *chain* is now a self-contained, named function. 

```javascript
loadDeparture( user ).then( loadFlight ).then( loadForecast );
```

Each of these functions internally makes a service call, gets a promise, and attaches a success handler to the promise. And Each handler publishes something to the scope.

But two other VERY important things are now happening:

1) Returning Promises instead of data objects:
>
Notice that each of the chain segments (loadDeparture, loadFlight, loadWeather) returns a Promise. The important thing to realize here is the instead of returning a data object, we are returning another promise. Returning promises allows use to build chains where each segment is only resolved when the promise at the segment resolves... and that promise could itself represent a subchain.
While a segment is waiting for its promise to resolve or reject... all the remaining segments in the chain are waiting... and in fact, those segments have not even been called yet.The async requests in subsequent segments are queued and have not even been called yet.
This is promise chaining. This is very powerful.

2) Success handlers return data values:
>
Notice that the internal Promise success handler of each segment returns a value... a value that may be passed as an argument value when invoking the next segment of the promise chain. See how the first segment `loadDeparture()` returns the `flightID`… which is passed as an argument when invoking the call to `loadFlight()`? And While `loadFlight()` returns the `flight` object, the next segment `loadWeather()` ignores that value.


This flattened-promise chain is now really easy to understand and manage.

An anti-pattern issue still exists here. This solution has that one (1) funky **hack**:  

Notice how the weather service had to use `$scope.departure.date` within its `getForecast()` call. `loadWeatherForecast()` can only directly receive a `flight` argument... and it does not have direct access to the `flight` reference. 


---

### Finally 

Finally, we should consider the dependencies of each segment of the *chain*. Notice that not all of our requests have to be sequential [and thus wait for all previous segments to finish first]. In our scenario, the Flight and Weather service calls could be requested in parallel [independent of each other]. 


![parallel chaining](https://f.cloud.github.com/assets/210413/1777751/2c3e687e-682a-11e3-83a9-f04f488a028c.jpg)

We will use the `$q.all()` and the `$q.spread()` methods to condense our code and centralize all `$scope` changes. 

```javascript
var FlightDashboard = function( $scope, user, travelService, weatherService, $q, $log )
    {
        var loadFlight = function( user )
            {
                return travelService.getDeparture( user.email );               // Request #1
            },
            parallelLoad = function ( departure )
            {
                // Execute #2 & #3 in parallel...

                return $q.all([
                        travelService.getFlight( departure.flightID ),         // Request #2
                        weatherService.getForecast( departure.date  )          // Reqeust #3
                    ])
                    .then( $q.spread( function( flight, weather )
                    {
                        $scope.departure   = departure;                        // Response Handler #1
                        $scope.flight      = flight;                           // Response Handler #2
                        $scope.weather     = weather;                          // Response Handler #3

						 // Let's force an error to demonstrate the reportProblem() works!
						 
                        throw( new Error("Just to prove catch() works! ") );
                    }));
            },
            reportProblems = function( fault )
            {
                $log.error( String(fault) );
            };


        // 3-easy steps to load all of our information...
        // and now we can include logging for of problems within ANY of the steps

        loadFlight( user )
            .then( parallelLoad )
            .catch( reportProblems );

    };

```


The last version is very clean and terse. I simplified even further AND I also added a **exception handler**!

>
The `$q.spread()` is a special [add-on](https://github.com/ThomasBurleson/angularjs-FlightDashboard/blob/master/lib/%24QDecorator.js) that is currently not part of AngularJS. I used `$QDecorator` to decorate the $q service and provide this feature.

### Live Demo

Click here to open the [Live Demo](http://thomasburleson.github.io/angularjs-FlightDashboard/)

Open Chrome Developer tools and you can breakpoint/step thru the logic and code base:

![screen shot 2013-12-15 at 2 03 59 pm](https://f.cloud.github.com/assets/210413/1750999/562d582e-65c4-11e3-93ea-de9e5a1b0eed.jpg)

### Summary

Hopefully I have shown you some elegant and sophisticated techinques for chaining promises. The above chain can easily become even more complicated:

![TreeOfChains](https://f.cloud.github.com/assets/210413/1750919/afbfb5a4-65be-11e3-93d6-b5b61865bd0b.jpg)

But even these complicated chains are easy to manage with the techniques that I have demonstrated.

And if this somewhat trivial example does  not convince you... check out a real-world refactor of the Dash.js class [DownloadRules Gist](https://gist.github.com/ThomasBurleson/7576083). The refactor is a Gist source with a conversation thread dicussing the tradeoffs and considerations. 

>
Readers can see how [in the [DownloadRules Gist](https://gist.github.com/ThomasBurleson/7576083)] how complex code and logic can be reduced and flattened into something very manageable and conceptually understandable.

You will have to decide whether you want to nest or flatten your promise chains. Just note that all of these approaches are simply techniques of **chaining functions** that either request more asynchronous activity or *handle* their async responses.
