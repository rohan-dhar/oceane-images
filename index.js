import "dotenv/config";
import express from "express";
import cors from "cors";
import authMiddleware from "./src/middleware/authMiddleware.js";
import images from "./src/images/index.js";

const app = express();

app.use(cors());
app.use(authMiddleware);

app.use("/images", images);

const port = process.env.PORT || 6542;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
