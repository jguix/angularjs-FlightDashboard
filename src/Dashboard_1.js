
   var  FlightDashboard = function( $scope, user, travelService, weatherService )
        {
            $scope.user = user;

            // Level 1
            travelService
                .getDeparture( user.email )                 // Request #1
                .then( function( departure )                // Response Handler #1
                {
                    $scope.departure = departure;

                });

        };


