const mongojs = require('mongojs');
const debug = require('debug')('mongofire');

const registeredCollections = {};
const Events = ['insert', 'search', 'update', 'remove'];


const methodOn = collection => (event, cb) => {
  debug('register on listener: ', event);
  const id = `${new Date().getTime()}-${Math.floor(Math.random() * 100000)}`;
  if (Events.indexOf(event.toLowerCase()) === -1) return null;

  switch (event) {
  case 'insert':
    registeredCollections[collection].onInsertListeners[id] = cb;
    return id;

  case 'update':
    registeredCollections[collection].onUpdateListeners[id] = cb;
    return id;

  case 'remove':
    registeredCollections[collection].onRemoveListeners[id] = cb;
    return id;

  case 'search':
    registeredCollections[collection].onSearchListeners[id] = cb;
    return id;

  case 'all':
    registeredCollections[collection].onAllListeners[id] = cb;
    return id;

  default:
    return null;
  }// end switch
}; // end 'on' method

function mongofire(url = '', collections) {
  debug('creating...');
  const db = mongojs(url, collections);
  const handlers = {
    get: (a, b) => {
      debug('.get: ', a, b);
      if (b in registeredCollections === true) return db[b];
      if ('on' in db[b] === false) db[b].on = methodOn(b);

      const nativeMethod = {};

      ['insert', 'update', 'remove', 'find'].map((method) => {
        debug('adding method ', method);

        nativeMethod[method] = db[b][method];
        db[b][method] = function () {
          const args = Array.from(arguments);
          const cb = args.pop();
          console.info('pre handler: ', method);
          const handler = (err, doc) => {
            cb(err, doc);
            Object.keys(registeredCollections[b].onInsertListeners)
              .forEach(k => registeredCollections[b].onInsertListeners[k](err, doc));

            Object.keys(registeredCollections[b].onAllListeners)
              .forEach(k => registeredCollections[b].onAllListeners[k](err, doc));
          }; // end handler

          args.push(handler);
          nativeMethod[method].apply(db[b], args);
        };
      });

      if (b in registeredCollections === false) {
        registeredCollections[b] = {
          onInsertListeners: {},
          onRemoveListeners: {},
          onUpdateListeners: {},
          onSearchListeners: {},
          onAllListeners: {},
        };
      }

      db[b].$fields = new Proxy(db[b], (c, f) => {
        console.info('c y f: ', c, f);
      })
      return db[b];
    },
  };
  const fire = new Proxy(db, handlers);
  fire.version = '1.0.0.';
  return fire;
}

module.exports = mongofire;
