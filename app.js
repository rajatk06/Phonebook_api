const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");
const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
  })
);
app.use(bodyParser.json());
app.use(routes);
app.get("/", (req, res) => res.send("DATABASE SERVER"));
app.listen(port, () => console.log("Server listening on port " + port));
