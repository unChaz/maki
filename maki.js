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

// maki.resource.IPN.pre('save', function( done ) {
//   var ipn = this;
//   
//   rest.get('https://bitpay.com/i/' + ipn.invoiceId).on('complete', function(result) {
//     if (result instanceof Error) {
//       done(result)
//       this.retry(5000);
//     } else {
//       done();
//     }
//   });
// });
// 
// // all of my custom behavior
// maki.resources.IPN.post('create', function( ipn , done ) {
//   var self = this;
// 
//   var fakeRequest = {
//     body: {
//       name: req.body.buyerName
//     }
//   }
//   var fakeResponse = {
//     provide: function( name , data ) {
//       console.log('[SUCCESS]', name , data);
//     }
//   }
//   
//   maki.resources.Contribution.create()( fakeRequest , fakeResponse , function(err, done) {
//     done();
//   });
//   
// });

maki.start();
