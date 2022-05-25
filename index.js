const express = require("express");
const usersRoute = require("./routes/users");
const orgRoutes = require("./routes/orgs");
const cookieParser = require("cookie-parser");
const stats = require("./routes/statistics");
const incidentRoute = require("./routes/incidentsNew");
const settingsRoutes = require("./routes/settings");
const mailListener = require("./mailparser/mailincidentParser");
const db = require("./db/db");
const pgClient = require("./db/pgClient");

pgClient.connect();

const query = pgClient.query("LISTEN post_event");

mailListener.start(); // start listening
const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.set("origins", "*localhost:3000");
app.set("socketio", io);

app.use(cookieParser());

app.use(express.json());
app.use(incidentRoute);
app.use(usersRoute);
app.use(orgRoutes);
app.use(settingsRoutes);
app.use(stats);

pgClient.on("notification", async data => {
  const post = JSON.parse(data.payload);
  const assignedUser = await pgClient.query(
    `SELECT username, assigned, id from incident where id= ${post.incidentid}`
  );

  //filters out the user to send a socket/io message to
  const idToEmit = usersIDList.filter(
    user => user.username === assignedUser.rows[0].assigned
  );

  //sending a message to a client
  io.sockets.connected[idToEmit[0].id].emit("assigned", {
    assigned: assignedUser.rows[0].assigned,
    id: post.incidentid,
    incidentreply: post.reply
  });

  /*io.to(`${idToEmit.id}`).emit("assigned", {
    assigned: assignedUser.rows[0].assigned,
    id: post.incidentid,
    incidentreply: post.reply
  });*/
});

let usersIDList = [];

io.on("connection", socket => {
  socket.on("username", username => {
    usersIDList.push({
      id: socket.id,
      username: username
    });

    console.log(usersIDList);
  });

  socket.on("disconnect", () => {
    usersIDList = usersIDList.filter(user => socket.id === usersIDList.id);
  });
});

const PORT = process.env.PORT || 4500;

server.listen(PORT);

/* app.listen(PORT, () => {
  console.log(PORT, "you are now connected to the server");
}); */
