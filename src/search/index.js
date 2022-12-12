import express from "express";
import prisma from "../prisma.js";
import { badResponse, serverError } from "../utils/errorResponses.js";

const route = express();

// GET /search/:keyword
route.get("/:keyword", async (req, res) => {
	const keyword = req.params.keyword;
	if (!keyword) badResponse(res);

	try {
		const searchImages = await prisma.image.findMany({
			where: {
				userId: req.user,

				OR: [
					{ name: { contains: keyword } },
					{ tag: { contains: keyword } },
					{ location: { contains: keyword } },
					//{ metadata: {contains: keyword} },
				],
			},
		});

		return res.json({
			status: "search results returned",
			images: searchImages,
		});
	} catch (exception) {
		console.log(exception);
		return serverError(res);
	}
});

export default route;
