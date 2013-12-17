(function() {
    "use strict";



   var  FlightDashboard = function( $scope, user, flightService )
        {

            $scope.user = user;
        };

    window.FlightDashboard = [ "$scope", "user", "flightService", FlightDashboard ];

}());

