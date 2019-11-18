# Portfolio Tracking Application

## Endpoints
1. Adding trades for a security, and updating the portfolio accordingly.
2. Updating a trade, and updating the portfolio accordingly.
3. Removing a trade from a portfolio.
4. Fetching portfolio: Response includes all the securities and trades corresponding to it.
5. Fetching holdings: It is an aggregate view of all securities in the portfolio with its final quantity and average buy price.
6. Fetching returns: Fetches current price from nse api and calculates returns as specified.
### All Endpoints are included in the postman collection.

## Limitations
1. Removing a Trade is complicated. If a trade is older than 1 transaction, it may cause discrepancies. Example, I buy 4 securities, sell 4 and then try reverting the buy transaction. We will have to revert all trades related to that security that were added after that particular trade. I am not adding that functionality in code and will give an error if a situation like this occurs. The same problems might happen when trying to update the trade.
2. I am updating a trade by removing the previous values and registering a new trade with the new parameters. I realise that the tradeId will change.

## Test Cases
1. Adding a trade and checking how it affects the holdings and returns
2. Reverting or updating a trade
3. All CRUD methods and their validations
4. Negative testing by giving wrong input

## Postman Collection
Local Testing: https://www.getpostman.com/collections/f66daf29746fd93e9faf

Hosted Testing:


### README will be updated as the project progresses
