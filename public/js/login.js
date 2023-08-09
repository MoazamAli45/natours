/* eslint disable */
import { showAlert } from './alerts';
import axios from 'axios';
export const login = async (email, password) => {
  console.log('login');

  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        //   data to be send
        email,
        password,
      },
    });
    // console.log(res);
    if (res.status === 200) {
      showAlert('success', 'User successfully Logged In');
      window.setTimeout(() => {
        // after 1500 ms we want to move back
        location.assign('/');
      }, 1500); // 1500 ms
    }
  } catch (err) {
    // console.log('Not Logged In');
    // in axios error
    showAlert('error', err.response.data.message);
  }
};

// logout
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    // console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Successfully Logged Out!');
      window.setTimeout(() => {
        location.assign('/');
        // location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
