var API = require('indian-stock-exchange');

// Considering only NSE
var NSEAPI = API.NSE;



var getLastPrice = function(input) {
    return new Promise(function(resolve, reject) {
        NSEAPI.getQuoteInfo(input)
            .then(function(response) {
                if (response && response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                    // console.log("response from getQuoteInfo endpoint: ", response.data);
                    resolve(response.data.data[0])
                } else {
                    resolve(false)
                }
            })
            .catch(function(error) {
                console.log("error in calling getQuoteInfo endpoint: ", error);
            })
    })
}


module.exports = {
    getLastPrice: getLastPrice
}
