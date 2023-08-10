class APIFeatures {
  // (Tour.find(),req.query)
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // this will delete all the fields from query object
    excludedFields.forEach((el) => delete queryObject[el]);
    // console.log(req.query, queryObject);

    // 1B) ADVANCE FILTERING
    // In  MongoDB we use $ sign for operators
    // {difficulty: 'easy', duration: {$gte: 5}}

    // {difficulty: 'easy', duration: {gte: '5'}}
    // \b exact match
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      // $gte $gt $lte $lt     That will match with query string
      (match) => `$${match}`,
    );

    // console.log(JSON.parse(queryString));
    this.query = this.query.find(JSON.parse(queryString));

    // FOR CHAINING FURTHER
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      //  sort=name,price   it is common it works just fine

      // IF Repeat  sort keyword then it will show error so we are using hpp midddleware (sort=duration & sort=price)
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);

      // Chaining
      this.query = this.query.sort(sortBy);
    } else {
      // by default on time basis
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(',').join(' ');

      // Chaining
      // including those fields   select('name duration')
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }
    // console.log(this);
    return this;
  }

  paginate() {
    // page=2&limit=10
    const page = this.queryString.page * 1 || 1; // mulitiplying with one in order to convert into number
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    // async await so not use  not know working
    // if (this.queryString.page) {
    //   const count = await Tour.countDocuments();
    //   // if skip become greater than total result will be zero then it will throw error
    //   if (skip >= count) throw new Error('This page does not exist');
    // }
    // if (this.query.length == 0) {
    //   return 'This does not contain any document';
    // }

    return this;
  }
}

module.exports = APIFeatures;
