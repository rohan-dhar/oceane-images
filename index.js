import "dotenv/config";
import express from "express";
import cors from "cors";
import authMiddleware from "./src/middleware/authMiddleware.js";
import images from "./src/images/index.js";
import albums from "./src/albums/index.js";
import bodyParser from "body-parser";

const app = express();

const jsonParser = bodyParser.json();

app.use(cors());
app.use((req, res, next) => jsonParser(req, res, next));
// app.use(authMiddleware);

app.use("/images", images);
app.use("/albums", albums);

const port = process.env.PORT || 6542;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
