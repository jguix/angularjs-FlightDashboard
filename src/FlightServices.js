(function(angular) {
    "use strict";


    angular.module( "FlightServices", [ ] )
        .config( window.$QDecorator )
        .service( "user", function()
        {
            return {
               email      : "ThomasBurleson@Gmail.com",
               repository : "https://github.com/ThomasBurleson/angularjs-FlightDashboard"
            };
        })
        .service( "flightService", function( user, $q )
        {
            return {
                getFlightDetails : function( user )
                {
                    var dfd = $q.defer();

                        // Mock travel information for the user's flight

                        dfd.resolve({
                            userID : user.email,
                            flight : {
                                id        : "UA_343223",
                                departure : "01/14/2014 8:00 AM"
                            }
                        });

                    return dfd.promise;

                },
                getPlaneDetails : function( flightID )
                {
                    return $q.resolve ({
                        id    : flightID,
                        pilot : "Captain Morgan",
                        make : {
                            model : "Boeing 747 RC"
                        },
                        status: "onTime"
                    });
                }
            };
        })
        .service( "weatherService", function( $q )
        {
            return {
                getForecast : function( date )
                {
                    return $q.resolve({
                        date     : date,
                        forecast : "rain"
                    });
                }
            };

        });


}(window.angular));

