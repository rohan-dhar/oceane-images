import express from "express";

const routes = express();

routes.post("/", async (req, res) => {
	return res.json({ some: "images" });
});

export default routes;
