require("dotenv").config();

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};
const socketToRoom = {};
const roomID = socketToRoom[socket.id];
const port = process.env.PORT || 8000;

io.on("connection", (socket) => {
  
  socket.on("join", (roomID) => {
    //  repetição
    if (users[roomID]) {
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }

    socketToRoom[socket.id] = roomID;

    const activeUsers = users[roomID].filter((id) => id !== socket.id);
    socket.emit("all users", activeUsers);
  });

  socket.on("creatingSignal", (payload) => {
    io.to(payload.userToSignal).emit("joinUser", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returningSignal", (payload) => {
    io.to(payload.callerID).emit("receivingReturnSignal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    let room = users[roomID];

    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
  });
});

server.listen(port, () => console.log(`server is running on port ${port}`));
