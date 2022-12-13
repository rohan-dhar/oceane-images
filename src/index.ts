import "dotenv/config";
import express from "express";
import cors from "cors";
import authMiddleware from "./middleware/authMiddleware";
import images from "./images/index";
import albums from "./albums/index";
import search from "./search/index";

import bodyParser from "body-parser";

const app = express();

const jsonParser = bodyParser.json();

app.use(cors());
app.use((req, res, next) => jsonParser(req, res, next));
app.use(authMiddleware);

app.use("/images", images);
app.use("/albums", albums);
app.use("/search", search);

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
