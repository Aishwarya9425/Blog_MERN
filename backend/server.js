const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const app = express();
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
const usersRoute = require("./routes/usersRoute");
const blogsRoute = require("./routes/blogsRoute");
const blogActionsRoute = require("./routes/blogActionsRoute");

app.use(express.json());

app.use("/api/users", usersRoute);
app.use("/api/blogs", blogsRoute);
app.use("/api/blog-actions", blogActionsRoute);

const port = process.env.PORT || 5000;
const server = require("http").createServer(app);

// socket io
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
    // join room
    socket.on("join", (userId) => {
        socket.join(userId);
    });

    // listen for new notification
    socket.on("newNotification", (notification) => {
        socket.to(notification.userId).emit("newNotification", notification);
    });
});


const path = require("path");
__dirname = path.resolve();

// render deployment
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
