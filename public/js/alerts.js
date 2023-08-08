export const hideAlert = () => {
  const el = document.querySelector('.alert');
  // console.log('Hide ALert');
  // if el then remove
  if (el) el.parentElement.removeChild(el);
};

// SHOW ALERT
export const showAlert = (type, message) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  // console.log('Show ALert');
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 5000);
};
