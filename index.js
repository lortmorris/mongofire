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
    const nativeMethod = {};
    db[col].on = methodOn(col);
    registeredCollections[col] = {};

    Events.forEach((event) => {
      debug('adding method ', event, '  on ', col);

      registeredCollections[col][`on${event}Listeners`] = {};
      nativeMethod[`__${event}`] = db[col][event];
      console.info('db[col][event]: ', db[col][event]);
      db[col][event] = function hand() {
        const args = Array.from(arguments);
        const cb = args.pop();

        const handler = (err, doc) => {
          cb(err, doc);
          Object.keys(registeredCollections[col][`on${event}Listeners`])
            .forEach(k => registeredCollections[col][`on${event}Listeners`][k](err, doc));
        }; // end handler

        args.push(handler);
        nativeMethod[`__${event}`](args[0], args[1], args[2]);
        console.info('after end');
      };
    });
  });// end forEach
  return db;
}


module.exports = mongofire;
