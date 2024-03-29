import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import connectDB from "./MongoDB/connect.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryPlanRoutes.js";
import planlistRoutes from "./routes/planListRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send({ message: "Heyy!!" });
});

app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/planlist", planlistRoutes);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(8080, () => console.log("Server started"));
  } catch (error) {
    console.log(error);
  }
};

startServer();
