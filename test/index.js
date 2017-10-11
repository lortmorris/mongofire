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

mongofire.stats.on('remove', (result, data) => console.info('removed cb global: ', result, data));
mongofire.stats.on('insert', (result, data) => console.info('inserted cb global: ', result, data));
mongofire.stats.on('update', (result, data) => console.info('updated cb global: ', result, data));
mongofire.stats.on('find', (result, data) => console.info('found cb global: ', result, data));


const sale = (amount, paymentMethod) =>
  mongofire.sales.$insert({ added: new Date(), amount, paymentMethod }, (err, data) => {
    console.info('Registered sale: ', data);
  });

sale(35.50, 'cc');
sale(100.50, 'cash');
sale(154.24, 'cash');
sale(200.00, 'cash');
