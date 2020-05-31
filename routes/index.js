const router = require("express").Router();
const _ = require("lodash");
const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient;
const LIMIT = 4;
const client = new MongoClient(
  //"mongodb://localhost:27017/team-up",
  "mongodb+srv://rajat:rajat@cluster0-he3og.mongodb.net",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
client.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Connected to MongoDB");
  const users = client.db("fashion").collection("users");
  router.route("/users")
    .get(async (req, res) => {
      const page = req.query.page ? req.query.page : 0;
      const value = req.query.value
      //console.log(page)
      users
        .find(value ? { $text: { $search: value, $caseSensitive: false } } : {})
        .sort({ name: 1 })
        .skip(page * LIMIT)
        .limit(LIMIT)
        .toArray((err, fetched_users) => {
          if (err) {
            console.log(err);
            res.send("GET error");
            return;
          }
          users.estimatedDocumentCount((e, n) => res.send({ users: fetched_users, total: n }))
        });
    })
    .post(async (req, res) => {
      console.log(req.body)
      // users
      //   .find(req.body)
      //   .toArray((err, fetched_users) => {
      //     if (err) {
      //       console.log(err);
      //       res.send({ err: "GET error" });
      //       return;
      //     }
      //     if (fetched_users.length > 0) res.send({ err: "User already exists" });
      //     else users.insertOne(req.body, () => res.send("User Added"));
      //   });
    })
    .put(async (req, res) => {
      console.log(req.body)
    })
    .delete(async (req, res) => {
      users.deleteOne({ _id: new mongodb.ObjectId(req.query._id) }, (err) => {

        if (err) { console.log(err); res.send({ err: "Couldn't delete" }); }
        else res.send("User deleted");
      });
    });

  router.route("/validate")
    .post(async (req, res) => {
      const { field, value } = req.body;
      users.aggregate([{ $unwind: `$${field}` }, { $match: { [field]: value } }]).toArray((err, fetched_users) => {
        if (err) {
          res.send({ err: "Unable to find" });
          return;
        }
        if (fetched_users.length) res.send({ err: "already exists" })
        else res.send("ok")
      })
    })
});


module.exports = router;
