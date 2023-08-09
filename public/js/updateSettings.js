import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  //   console.log(data);
  const url =
    type === 'password'
      ? '/api/v1/users/updateMyPassword'
      : '/api/v1/users/updateMe';
  try {
    const res = await axios({
      method: 'PATCH',
      url: url,
      data: data,
    });
    // console.log(res);
    if (res.status === 200) {
      showAlert('success', `${type.toUpperCase()} updated Successfully!`);
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
