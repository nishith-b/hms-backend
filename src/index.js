const express = require("express");
const apiRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const { ServerConfig, DBConfig } = require("./config");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

DBConfig.connectDB();

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, () => {
  console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
