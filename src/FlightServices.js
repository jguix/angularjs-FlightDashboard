(function(angular) {
    "use strict";

    angular.module( "FlightServices", [ ] )
           .config( window.$QDecorator )
            /**
             * User model
             */
           .service( "user", function(){
                return {
                    email : "ThomasBurleson@Gmail.com"
                };
            })
            /**
             * Flight service
             */
           .service( "flightService", function( user, $q )
            {
               return {
                   /**
                    * Return mock flight data for the specified user
                    */
                   getFlightDetails : function( user )
                   {
                       return $q.resolve ({
                                userID : user.email,
                                flight : {
                                    id        : "UA_343223",
                                    departure : "01/14/2014 8:00 AM"
                                }
                              });

                   },
                   /**
                    * Get mock plane information
                    */
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
            /**
             * Weather service
             */
            .service( "weatherService", function( $q )
            {
                return {
                    getForecast : function( date )
                    {
                        return $q.resolve ({
                                   date     : date,
                                   forecast : "rain"
                               });
                    }
                };

            });


}(window.angular));

