const express = require("express");
const apiRoutes = require("./routes");
const { ServerConfig, DBConfig } = require("./config");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

DBConfig.connectDB();

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, () => {
  console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
