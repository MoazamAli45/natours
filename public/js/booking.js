import axios from 'axios';
import { showAlert } from './alerts';
// import { Stripe } from 'stripe';
// import { Stripe } from '@stripe/stripe-js/';

// Stripe.js will not be loaded until `loadStripe` is called

// Public key for frontend
// let stripe;
// (async function () {
//   stripe = await loadStripe(
//     'pk_test_51NcWjuL6W01XTSlfegzHaZ8VKvsbn3cTY88m0GbD7eG2L0UwekTJZtstoEOvvfv1Xu4yoCl7buXOjDFfnmVdeiwJ00yRNsesUD',
//   );
// })();

//  AS THIS IS NOT WORKING
const stripe = Stripe(
  'pk_test_51NcWjuL6W01XTSlfegzHaZ8VKvsbn3cTY88m0GbD7eG2L0UwekTJZtstoEOvvfv1Xu4yoCl7buXOjDFfnmVdeiwJ00yRNsesUD',
);

export const bookTour = async (tourId) => {
  // Get the sessioon from api
  try {
    const session = await axios(
      //   this will be same as relative as appi and website is hosted on same platform
      `/api/v1/tours/bookings/checkout-session/${tourId}`,
    );
    // console.log(session.data.session.id);
    // console.log(stripe.redirectToCheckout);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    // console.log('completed Checkout!');
  } catch (err) {
    showAlert('error', err);
    // console.log('error' + err);
  }
};
