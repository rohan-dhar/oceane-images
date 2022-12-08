import "dotenv/config";
import express from "express";
import cors from "cors";
import authMiddleware from "./src/middleware/authMiddleware.js";
import images from "./src/images/index.js";
import albums from "./src/albums/index.js";
import search from "./src/search/index.js"
import bodyParser from "body-parser";

const app = express();

const jsonParser = bodyParser.json();

app.use(cors());
app.use((req, res, next) => jsonParser(req, res, next));
// app.use(authMiddleware);

app.use("/images", images);
app.use("/albums", albums);
app.use("/search", search);

const port = process.env.PORT || 6542;

app.get("/", async (req, res, next) => {
	res.status(200).json({ status: "api running" });
});

// Catch all uncaught routes and 404
app.all("*", (req, res, next) => {
	res.status(404).json({ status: "route not found for request" });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
