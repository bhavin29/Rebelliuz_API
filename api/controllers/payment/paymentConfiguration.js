
var paypal = require('../../');


exports.settings = function (req, res) {

var first_config = {
    'mode': 'sandbox',
    'client_id': '<FIRST_CLIENT_ID>',
    'client_secret': '<FIRST_CLIENT_SECRET>'
};

var second_config = {
    'mode': 'sandbox',
    'client_id': '<SECOND_CLIENT_ID>',
    'client_secret': '<SECOND_CLIENT_SECRET>'
};

//This sets up client id and secret globally
//to FIRST_CLIENT_ID and FIRST_CLIENT_SECRET
paypal.configure(first_config);


paypal.authorization.get("99M58264FG144833V", function (error, authorization) {
    if (error) {
        console.error(error);
    } else {
        console.log(authorization);
    }
});


};
