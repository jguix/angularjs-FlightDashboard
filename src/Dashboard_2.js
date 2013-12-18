(function() {
  "use strict";

  // Nested 3-call sequence:  getFlightDetails() -> getPlaneDetails() -> getForecast()

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

    window.FlightDashboard = [ "$scope", "user", "travelService", "weatherService", FlightDashboard ];

}());

