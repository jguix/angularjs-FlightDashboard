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
        .service( "travelService", function( user, $q )
        {
            // Flight API (each returns a promise)
            return {
                getDeparture : function( user )
                {
                    var dfd = $q.defer();

                        // Mock departure information for the user's flight

                        dfd.resolve({
                            userID   : user.email,
                            flightID : "UA_343223",
                            date     : "01/14/2014 8:00 AM"
                        });

                    return dfd.promise;

                },
                getFlight : function( flightID )
                {
                    return $q.resolve ({
                        id    : flightID,
                        pilot : "Captain Morgan",
                        plane : {
                            make  : "Boeing 747 RC",
                            model : "TA-889"
                        },
                        status: "onTime"
                    });
                }
            };
        })
        .service( "weatherService", function( $q )
        {
            // Weather API (each returns a promise)
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

