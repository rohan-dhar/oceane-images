import express from "express";
import { badResponse } from "../utils/errorResponses.js";
import imageTypes from "../utils/imageTypes.js";
import { makeS3UploadUrl } from "../utils/s3.js";

const routes = express();

routes.post("/startUpload", async (req, res) => {
	let imageType = req.body?.imageType;
	console.log("req.json :>> ", req.json);
	console.log("imageType :>> ", imageType);
	if (!imageType || typeof imageType !== "string") {
		badResponse(res);
		return;
	}

	imageType = imageType.toLowerCase();
	if (!imageTypes[imageType]) return badResponse(res);

	const uploadUrl = await makeS3UploadUrl(imageType);

	if (!uploadUrl)
		return badResponse(res, { status: "Could not create S3 session" });

	return res.json({ uploadUrl });
});

export default routes;
