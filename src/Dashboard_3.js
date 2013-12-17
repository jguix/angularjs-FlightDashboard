(function() {
    "use strict";

    var FlightDashboard = function( $scope, user, flightService, weatherService )
        {
            var loadFlight = function( user )
                {
                    return flightService
                            .getFlightDetails( user.email )                     // Request #1
                            .then( function( details )
                            {
                                $scope.flight = details.flight;                        // Response Handler #1

                                return details.flight;
                            });
                },
                loadPlaneStatus = function( flight )
                {
                    return flightService
                            .getPlaneDetails( flight.id )                       // Request #2
                            .then( function( plane )
                            {
                                $scope.plane = plane;                           // Response Handler #2
                                return plane;
                            });
                },
                loadWeatherForecast = function()
                {
                    return weatherService
                            .getForecast( $scope.flight.departure )                   // Reqeust #3
                            .then(function( info )
                            {
                                $scope.weather = forecast;                // Response Handler #3
                                return info;
                            });
                };


            // 3-easy steps to load all of our information...
            // and includes logging of problems with ANY of the steps

            loadFlight( user )
                .then( loadPlaneStatus )
                .then( loadWeatherForecast );

            $scope.flight     = null;
            $scope.plane      = null;
            $scope.weather    = null;

        };


    window.FlightDashboard = [ "$scope", "user", "flightService", "weatherService", FlightDashboard ];

}());

