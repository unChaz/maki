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

maki.resources.IPN.post('save', function( done ) {
  var ipn = this;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log("IPN received: " + ipn);
  rest.get('https://' + config.app.apiKey + ':x@' + config.app.bitpayEnv + '/invoices/' + ipn.id).on('complete', function(result) {
    if (result instanceof Error || result.error) {
      console.log(result.error || result);
      done(result.error || result);
    } else {
      ipn.price = result.price;
      ipn.btcPrice = result.btcPrice;
      if(result.buyerFields) {
        ipn.buyerName = result.buyerFields.buyerName;
      }
      ipn.date = result.date;
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
  
  Contribution.find({}, function(err, contributions) {
    var total = 0;
    contributions.forEach(function(contribution) {
      total += contribution.btcPrice;
    })
    data.contributed = total;
    
    var query = Contribution.findOne().sort({$natural:-1});
    
    query.exec(function(err, contribution) {
      if(err) {
        console.log(err)
      }
      if (contribution) {
        data.latest = contribution;
      } else {
        data.latest = false;
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
