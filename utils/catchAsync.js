module.exports = (fn) => {
  // when error come this will pass the control to the global error middleware
  return (req, res, next) => {
    // as this function returns a promise we can use catch to catch error and passinng to next
    // it will pass req,res and next to that function and if error comes then pass to global middleware
    fn(req, res, next).catch((err) => next(err));
  };
};
