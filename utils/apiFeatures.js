class APIFeatures {
  // queryString = req.query
  // query = Tour.find()
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // extract the sorting parameters. it can be one or multiple
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // default sort by creation time
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' '); // extract the required fields. it can be one or multiple
      // console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // just exclude the __v
    }
    return this;
  }

  paginte() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
