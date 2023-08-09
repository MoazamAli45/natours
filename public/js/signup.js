import axios from 'axios';
import { showAlert } from './alerts';
export const signup = async (name, email, password, passwordConfirm) => {
  console.log(signup);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log(res);
    if (res.status === 201) showAlert('success', 'Successfully Registered');
    window.setTimeout(() => {
      // after 1500 ms we want to move back
      location.assign('/');
    }, 1500); // 1500 ms
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
