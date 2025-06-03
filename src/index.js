const express = require("express");
const apiRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors"); 
const { ServerConfig, DBConfig } = require("./config");

const app = express();

app.use(cors({
  origin: "*",
  credentials: true,               
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

DBConfig.connectDB();

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, () => {
  console.log(`✅ Server started on PORT : ${ServerConfig.PORT}`);
});
