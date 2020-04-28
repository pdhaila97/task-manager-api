const express = require("express");
require("./db/mongoose");
const Task = require("./models/task");

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(require("./routers/user.routes"));
app.use(require("./routers/task.routes"))

app.listen(port, () => {
    console.log("Server is on at port ", port);
})