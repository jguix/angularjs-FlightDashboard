
    var FlightDashboard = function( $scope, user, travelService, weatherService, $log )
        {
            /**
             * Cool logging feature for rejections or exceptions
             */
            var reportProblems = function( fault )
            {
                $log.error( String(fault) );
            };

            // Level 1

            travelService
                .getDeparture( user.email )                            // Request #1
                .then( function( departure )                           // Response Handler #1
                {
                    $scope.departure = departure;

                    // Level 2

                    return travelService
                            .getFlight( departure.flightID )           // Request #2
                            .then( function( flight  )                 // Response Handler #2
                            {
                                $scope.flight = flight;

                                // Level 3

                                return weatherService
                                    .getForecast( departure.date )     // Reqeust #3
                                    .then( function( weather )         // Response Handler #3
                                    {
                                        $scope.weather = weather;
                                    });
                            });
                })
                .catch( reportProblems );
        };
