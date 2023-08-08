// console.log('Hello from Parcel New');

import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { signup } from './signup';
import { bookTour } from './booking';

const form = document.querySelector('.form-login');
const logoutBtn = document.querySelector('.nav__el--logout');

if (form)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailLogin = document.getElementById('email').value;
    const passwordLogin = document.getElementById('password').value;
    // console.log(email);
    login(emailLogin, passwordLogin);
  });

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// Updating

const update = document.querySelector('.form-user-data');

if (update) {
  update.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();

    // because of also file pic
    form.append('name', document.querySelector('.updateName').value);
    form.append('email', document.querySelector('.updateEmail').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const name = document.querySelector('.updateName').value;
    // const email = document.querySelector('.updateEmail').value;
    // console.log(nameUpdate);
    // console.log(form);
    updateSettings(form, 'data');
  });
}

// Updating Password
const updatePasswordForm = document.querySelector('.form-user-password');
console.log(updatePasswordForm);

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // console.log(password);
    const btn = document.querySelector('.btn--save-password');

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    document.querySelector('.btn--save-password').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// Signup

const signupForm = document.querySelector('.form-signup');

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameSignup = document.getElementById('name-signup').value;
    const emailSignup = document.getElementById('email-signup').value;
    const passwordSignup = document.getElementById('password-signup').value;
    const passwordConfirmSignup = document.getElementById(
      'password-confirmsignup',
    ).value;
    console.log(nameSignup);

    signup(nameSignup, emailSignup, passwordSignup, passwordConfirmSignup);
  });
}

// tour bookings
const bookTourBtn = document.getElementById('bookTour');
if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    console.log('Clicked');
    e.target.textContent = 'Processing ... ';
    // in html it is with dash in js it is automatically converted to camel case
    const tourId = e.target.dataset.tourId;

    bookTour(tourId);
  });
}
