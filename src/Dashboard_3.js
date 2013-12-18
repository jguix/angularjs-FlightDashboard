(function() {
    "use strict";

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
            $scope.flight     = null;
            $scope.plane      = null;
            $scope.weather    = null;

        };


    window.FlightDashboard = [ "$scope", "user", "travelService", "weatherService", FlightDashboard ];

}());

