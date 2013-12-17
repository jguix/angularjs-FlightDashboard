(function( ) {
    "use strict";

    // 3-call sequence:  getFlightDetails() -> (getPlaneDetails() + getForecast())

    var FlightDashboard = function( $scope, user, flightService, weatherService, $q )
        {

            var loadFlight = function( user )
                {
                    return flightService.getFlightDetails( user.email );            // Request #1
                },
                loadStatusAndWeather = function ( response )
                {
                    var flight = response.flight;

                    // Execute #2 & #3 in parallel...

                    return $q.all([
                            flightService.getPlaneDetails( flight.id ),             // Request #2
                            weatherService.getForecast( flight.departure )          // Reqeust #3
                        ])
                        .then( $q.spread( function( plane, info )
                        {
                            // update the $scope all together for perf improvements

                            $scope.flight      = flight;                            // Response Handler #1
                            $scope.plane       = plane;                             // Response Handler #2
                            $scope.forecast    = info.forecast;                     // Response Handler #3

                        }));
                };


            // Wow! So much simpler...

            loadFlight( user ).then( loadStatusAndWeather );


        };


    window.FlightDashboard = [ "$scope", "user", "flightService", "weatherService", "$q", FlightDashboard ];

}( ));

