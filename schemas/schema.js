/* Securities:​ A simple definition of a security is any proof of ownership or debt that has been
assigned a value and may be sold. Example - Tata Consultancy Services Limited (TCS) one of
the companies which became public in 2004 and investors can buy and sell shares of TCS.
Currently price of 1 share (can call it quantity also) of TCS is Rs. 1,843.45. All the information is
publicly available. Other listed companies - WIPRO (Wipro Limited), GODREJIND (Godrej
Industries Ltd). */
var security = {
    _id: ObjectId(""),
    tickerSymbol: "",
    currentPrice: ""
}

var portfolio = [{
    tickerSymbol: "",
    quantity: 0,
    averageBuyPrice: 100.00
}]

var trade = {
    tradeId: "",
    tickerSymbol: "",
    quantity: 0,
    sellPrice: 0.00
}
