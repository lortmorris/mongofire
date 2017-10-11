const mongojs = require('mongojs');
const debug = require('debug')('mongofire');

const registeredCollections = {};
const Events = ['insert', 'find', 'update', 'remove'];


const methodOn = collection => (event, cb) => {
  debug('register on listener: ', event);
  const id = `${new Date().getTime()}-${Math.floor(Math.random() * 100000)}`;
  if (Events.indexOf(event.toLowerCase()) === -1) return null;
  registeredCollections[collection][`on${event}Listeners`][id] = cb;
  return id;
}; // end 'on' method

function mongofire(url = '', collections) {
  debug('creating...');
  const db = mongojs(url, collections);


  collections.forEach((col) => {
    db[col].on = methodOn(col);
    registeredCollections[col] = {};

    Events.forEach((event) => {
      debug('adding method ', event, '  on ', col);

      registeredCollections[col][`on${event}Listeners`] = {};
      db[col][`$${event}`] = function hand() {
        const args = Array.from(arguments);
        const cb = args.pop();

        const handler = (err, doc) => {
          cb(err, doc);
          Object.keys(registeredCollections[col][`on${event}Listeners`])
            .forEach(k => registeredCollections[col][`on${event}Listeners`][k](err, doc));
        }; // end handler

        args.push(handler);
        return db[col][`${event}`](args[0], args[1], args[2]);
      };
    });

    db[col].$schema = (schema) => {
      const fields = Object.keys(schema);
      return fields.map((field) => {
        const conf = schema[field];
        if ('$from' in conf) {
          const cb = ($localconf) => {
            db[$localconf.$from].on('insert', (err, docs) => {
              if ('$count' in $localconf) {
                db[$localconf.$from].find($localconf.$count.query).count((e, result) => {
                  db[$localconf.collection].findOne($localconf.$count.where, {}, (e2, d2) => {
                    if (d2) {
                      return db[$localconf.collection].update({}, { $set: { [field]: result } });
                    }
                    return db[$localconf.collection].insert({ [field]: result });
                  });
                });
              }// is $count method

              if ('$sum' in $localconf) {
                db[$localconf.$from].find($localconf.$sum.query, (e, result) => {
                  const total = result.reduce((acc, current) => {
                    return { total: acc.total += current[$localconf.$sum.prop] };
                  }, { total: 0 });
                  db[$localconf.collection].findOne($localconf.$sum.where, {}, (e2, d2) => {
                    if (d2) {
                      return db[$localconf.collection].update({}, { $set: { [field]: total.total } });
                    }
                    return db[$localconf.collection].insert({ [field]: total });
                  });
                });
              }// is $count method
            });
          };
          cb(Object.assign({}, conf, { collection: col, field }));
        }
        return null;
      });
    };
  });// end forEach
  return db;
}


module.exports = mongofire;
