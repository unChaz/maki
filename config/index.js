/* This file is a config, that exposes various
   meaningful values to the rest of the application.
   This is done using the module.exports function,
   which sets them when require('./thisfile') is run. */

module.exports = {
  dns: {
    name: process.env.MAKI_DNS_NAME || 'localhost'
  },
  services: {
    http: {
        port: process.env.MAKI_HTTP_PORT || 9200
      , host: process.env.MAKI_HTTP_HOST || 'localhost'
    }
  },
  database: {
    name: process.env.MAKI_DATABASE_NAME   || 'maki',
    masters: (process.env.MAKI_DATABASE_MASTERS)
      ? JSON.parse(process.env.MAKI_DATABASE_MASTERS)
      : [ 'localhost' ]
  },
  sessions: {
      enabled: process.env.MAKI_SESSIONS_ENABLE || true
    , secret:  process.env.MAKI_SESSIONS_SECRET || 'this can be any random string, you can even use this one. :)'
  },
  redis: {
      host: process.env.MAKI_REDIS_HOST || 'localhost'
    , port: process.env.MAKI_REDIS_PORT || 6379
  },
  sockets: {
      timeout: process.env.MAKI_SOCKETS_TIMEOUT || 30000
  },
  auth: {
    local: {
      enabled: true
    }
  },
  views: {
    plugins: {
      'moment': require('moment')
    }
  },
  app: {
    bitpayEnv: "bitpay.com",
    apiKey: "BRrn9LuQqcv5iNZOkwSGXrARc0DlLcdxNZLqJaap0cQ",
    goal: 1000
  }
};
