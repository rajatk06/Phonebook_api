const router = require("express").Router();
const _ = require("lodash");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const LIMIT = 4;
const client = new MongoClient(
  //"mongodb://localhost:27017/",
  "mongodb+srv://rajat:rajat@cluster0-he3og.mongodb.net",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
client.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Connected to MongoDB");
  const users = client.db("fashion").collection("users");
  router
    .route("/users")
    .get(async ({ query }, res) => {
      const { page = 0, value } = query;
      //console.log(page);
      users.find(
        value ? { $text: { $search: value, $caseSensitive: false } } : {},
        (e, fetched_users) => {
          fetched_users.count((err, n) => {
            if (err) {
              console.log(err);
              res.send("GET count error");
              return;
            }
            fetched_users
              .sort({ name: 1 })
              .skip(page * LIMIT)
              .limit(LIMIT)
              .toArray((e, users_array) => {
                if (e) {
                  console.log(e);
                  res.send("GET array error");
                  return;
                }
                res.send({ users: users_array, total: n });
              });
          });
        }
      );
    })
    .post(async (req, res) => {
      users.insertOne(req.body, (err) => {
        if (err) {
          console.log(err);
          res.send({ err: "Error in updating" });
          return;
        }

        res.send("User Added");
      });
    })
    .put(async (req, res) => {
      const { _id, phone, email, name } = req.body;
      users.updateOne(
        { _id: new mongodb.ObjectId(_id) },
        {
          $set: { email, name, phone }
        },
        (err) => {
          if (err) {
            console.log(err);
            res.send({ err: "Error in updating" });
            return;
          }
          res.send("User Updated");
        }
      );
    })
    .delete(async (req, res) => {
      users.deleteOne({ _id: new mongodb.ObjectId(req.query._id) }, (err) => {
        if (err) {
          console.log(err);
          res.send({ err: "Couldn't delete" });
        } else res.send("User deleted");
      });
    });

  router.route("/validate").post(async (req, res) => {
    const { field, value } = req.body;
    users
      .aggregate([{ $unwind: `$${field}` }, { $match: { [field]: value } }])
      .toArray((err, fetched_users) => {
        if (err) {
          res.send({ err: "Unable to find" });
          return;
        }
        if (fetched_users.length) res.send({ err: `${field} already exists` });
        else res.send("ok");
      });
  });
});

module.exports = router;
