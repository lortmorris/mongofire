const mongofire = require('../index')('mongodb://127.0.0.1/mongofire', ['sales', 'stats']);

mongofire.stats.$fields = {
  amount: {
    sales: {
      $sum: {
        query: {},
        prop: 'amount',
      },
    },
  },
  totalSales: {
    sales: {
      $count: {
        query: {},
      },
    },
  },
  creditCardsAmount: {
    sales: {
      $sum: {
        query: { paymentMethod: 'cc' },
        prop: 'amount',
      },
    },
  },
  creditCardsTotalSales: {
    sales: {
      $count: {
        query: { paymentMethod: 'cc' },
        prop: 'amount',
      },
    },
  },
};

mongofire.stats.on('remove', (result, data) => console.info('removed cb global: ', result, data));
mongofire.stats.on('insert', (result, data) => console.info('inserted cb global: ', result, data));
mongofire.stats.on('update', (result, data) => console.info('updated cb global: ', result, data));
mongofire.stats.on('find', (result, data) => console.info('found cb global: ', result, data));
mongofire.stats.on('all', (result, data) => console.info('all cb global: ', result, data));
mongofire.stats.insert({ added: new Date(), number: Math.random() }, (err, data) => {
  console.info('insertered 1: ', err, data);
});

mongofire.stats.insert({ added: new Date(), number: Math.random() }, (err, data) => {
  mongofire.stats.find({}, {}, (err2, docs) => {
    if (err2) console.error('Error getting stats: ', err2);
    else console.info(' STATS > ', docs);
  });
});
