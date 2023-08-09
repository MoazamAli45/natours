/*eslint disable */

const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const CatchAsync = require('../utils/catchAsync');
const Tour = require('../Model/tourModel');
const User = require('../Model/userModel');
const Book = require('../Model/bookModel');

const handlerFactory = require('./handlerFactory');

// tour router
exports.getCheckoutSession = CatchAsync(async (req, res, next) => {
  // console.log(req);
  // Firstly GEt the tour using ID
  const tour = await Tour.findById(req.params.tourId);

  // Create the session
  //   console.log(tour);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // Actually We can create booking after deployment using stripe webhooks
    // But this is unsecure but we can use this for testing
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      //   {  // JONAS WAY
      //     name: `${tour.name} Tour`,
      //     description: tour.summary,
      //     images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
      //     amount: tour.price * 100,
      //     currency: 'usd',
      //     quantity: 1,
      //   },
      {
        price_data: {
          currency: 'usd', // Change currency as needed
          unit_amount: tour.price * 100, // Make sure this calculation is correct
          product_data: {
            name: `${tour.name} tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });
  // sending using response the session
  res.status(200).json({
    status: 'success',
    session,
  });
});

//          FOR DEVELOPMENT PURPOSE ONLY
// exports.createCheckoutBooking = async (req, res, next) => {
//   const { user, price, tour } = req.query;
//   // This is fake way of creating we only craete after deplloyment through stripe
//   if (!user && !tour && !price) return next();

//   await Book.create({ user, tour, price });

//   // redirecting to home page
//   res.redirect(req.originalUrl.split('?')[0]);
// };

const createCheckoutBooking = async (session) => {
  const tour = session.client_reference_id;
  // as we want only id of user
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount;

  await Book.create({ user, tour, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOKKEY,
    );
  } catch (err) {
    // send to stripe
    return res.status(400).send(`Webhook error: ${err.message} ${err.stack}}`);
  }
  if (event.type === 'checkout.session.completed')
    createCheckoutBooking(event.data.object);

  res.status(200).json({
    received: true,
  });
};

exports.createBooking = handlerFactory.createOne(Book);
exports.getAllBooking = handlerFactory.getAll(Book);
exports.getBooking = handlerFactory.getOne(Book);
exports.updateBooking = handlerFactory.updateOne(Book);
exports.deleteBooking = handlerFactory.deleteOne(Book);
