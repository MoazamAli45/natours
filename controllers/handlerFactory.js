const CatchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const APIFeatures = require('../utils/apiFeatures');
// Refactoring of all create , delete and update function
// It will return another function but it has access to Modl due to closure
exports.deleteOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const { id } = req.params;

    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      message: null,
    });
  });

exports.createOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    // console.log(req.params.id);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated document
      runValidators: true, // check type to be updated with
    });
    // console.log(doc, 'document');
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  CatchAsync(async (req, res, next) => {
    //  /:id
    // console.log(req.params);
    const { id } = req.params;

    let query = Model.findById(id);
    // for tour population
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;
    // if id is same like but not match then it return tour null so we have to handle it
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    // console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// get ALl Features will work for all
exports.getAll = (Model) =>
  CatchAsync(async (req, res) => {
    // for Tour reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const apiFeatures = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // console.log(apiFeatures);
    // AS MONGOOS WILL CHAIN METHODS SO WE CAN USE THIS
    const doc = await apiFeatures.query;
    // console.log(tours, '+ Tours');
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
