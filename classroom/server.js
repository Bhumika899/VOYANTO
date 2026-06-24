const express = require("express");
const app = express();
const users = require("./routes/user.js");

app.get("/", (req, res) => {
    res.send("HI i am root");
});
app.use("/users", users);

app.get("/users", (req, res) => {
    res.send("get for users");
});
app.get("/users/:id", (req, res) => {
    res.send("get for show users");
});
app.post("/users", (req, res) => {
    res.send("post for users");
});
app.delete("/users/:id", (req, res) => {
    res.send("delete for users");
});
app.listen(3000, () => {
    console.log("server is listening");
})