require('debug-trace')({ always: true });


var config = require('./config');
var rest = require('restler');
var Maki = require('./lib/Maki');
var maki = new Maki( config );

maki.app.get('/how-to', function(req, res) {
  res.render('how-to');
});

maki.app.get('/the-plan', function(req, res) {
  res.render('the-plan');
});
  
var resources = [
  {
    name: 'Contribution',
    attributes: {
      buyerName: { type: String , max: 80 },
      btcPrice:  { type: Number },
      price:     { type: Number },
      currency:  { type: String },
      date:      { type: Date }
    }
  },
  {
    name: 'IPN',
    attributes: {
      id:        { type: String, id: true },
      status:    { type: String, enum: ['received', 'invalid', 'valid'], default: 'received' },
      buyerName: { type: String, max: 80 },
      price:     { type: Number },
      currency:  { type: String },
      date:      { type: Date },
      btcPrice:  { type: Number }
    }
  },
];

resources.forEach(function(resource) {
  maki.define( resource.name , resource );
});

maki.resources.IPN.pre('save', function( done ) {
  var ipn = this;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  rest.get('https://' + config.app.apiKey + ':x@' + config.app.bitpayEnv + '/api/invoice/' + ipn.id).on('complete', function(result) {
    if (result instanceof Error) {
      done(result)
      this.retry(5000);
    } else {
      done();
    }
  });
});

// all of my custom behavior
maki.resources.IPN.on('create', function( ipn ) {
  var self = this;
  
  var mockRequest = {
    body: ipn ,
    param: function() {}
  }
  
  var mockResponse = {
    provide: function( name , data ) {
      console.log('[SUCCESS]', name , data);
    }
  }

  maki.resources.Contribution.create()( mockRequest , mockResponse , function(err, done) {
    console.log("Created Contribution")
  });
  
});


maki.app.get('/', function(req, res, next) {
  var _ = require('underscore');
  var Contribution = maki.resources.Contribution.Model
  var data = {
    goal: config.app.goal
  };
  
  var getExRate = function(callback) {
    rest.get('https://bitpay.com/api/rates/usd').on('complete', function(result) {
      return callback(result.rate);
    });
  }
  
  var map = function() {
    emit('btcAmount', Contribution)
  }
  
  var reduce = function (key, vals) { return Array.sum(vals); };
  
  Contribution.mapReduce(
    {
      map: map,
      reduce: reduce
    },
    function(err, result) {
      data.contributed = result;
      var query = Contribution.findOne().sort({$natural:1});
      
      query.exec(function(err, contribution) {
        if(err) {
          console.log(err)
        }
        if (contribution) {
          data.latest = contribution;
        }
        getExRate(function(exRate) {
          if(err || !exRate) {
            console.log("Unable to get BTC Exchange Rate.")
          }
          data.exRate = exRate;
          res.render('index', data );
        });
      });
    });
});

maki.start();