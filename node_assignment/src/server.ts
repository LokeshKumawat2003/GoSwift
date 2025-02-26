import express from "express";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(express.json());
app.use("/", userRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
