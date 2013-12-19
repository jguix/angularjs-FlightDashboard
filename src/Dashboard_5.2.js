
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


