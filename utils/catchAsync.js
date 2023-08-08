module.exports = (fn) => {
  // when error come this will pass the control to the global error middleware
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
