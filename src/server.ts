import express from "express";
import cors from 'cors'
import dotenv from "dotenv";

dotenv.config();
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"
import jobRoutes from "./routes/jobRoutes";
// import applicationRoutes from "./routes/applicationRoutes";
// import savedJobRoutes from "./routes/savedJobRoutes";

const PORT = process.env.NEXT_API_URL || 4000;



const app = express();
app.use(cors(
  {
    origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'], // allowed origins
    credentials: true, // if you're sending cookies or auth headers
  }
));
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
// app.use("/api/applications", applicationRoutes);
// app.use("/api/saved-jobs", savedJobRoutes);

app.listen(PORT, () => {
  console.log("Server running on http://localhost:4000");
});
