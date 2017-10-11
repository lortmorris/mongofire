# Mongofire
Powered by: [Cesar Casas](https://ar.linkedin.com/in/cesarcasas "Linkedin")
# Example

```javascript
const mongofire = require('../index')('mongodb://127.0.0.1/mongofire', ['sales', 'stats']);

mongofire.stats.$schema({
  amount: {
    $from: 'sales',
    $sum: {
      query: {},
      prop: 'amount',
    },
  },
  totalSales: {
    $from: 'sales',
    $count: {
      query: {},
      where: {},
    },
  },
  creditCardsAmount: {
    $from: 'sales',
    $sum: {
      query: { paymentMethod: 'cc' },
      prop: 'amount',
      where: {},
    },
  },
  creditCardsTotalSales: {
    $from: 'sales',
    $count: {
      query: { paymentMethod: 'cc' },
      prop: 'amount',
      where: {},
    },
  },
});
```
