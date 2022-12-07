import prisma from "../utils/prisma.js";
import express from "express";
import { body, validationResult } from "express-validator";
import { badResponse } from "../utils/errorResponses.js";
import imageTypes from "../utils/imageTypes.js";
import { makeS3UploadUrl } from "../utils/s3.js";

const routes = express();

routes.post(
	"/startUpload",
	body("imageType").toLowerCase().isIn(imageTypes),
	async (req, res) => {
		const err = validationResult(req);
		if (!err.isEmpty()) {
			return badResponse(res, err.mapped());
		}

		const imageType = req.body?.imageType;
		const uploadUrlData = await makeS3UploadUrl(imageType);

		if (!uploadUrlData)
			return badResponse(res, { status: "Could not create S3 session" });

		return res.json(uploadUrlData);
	}
);

routes.post(
	"/",
	body("name").isString(),
	body("fileName")
		.isString()
		.custom((value) => {
			if (!imageTypes[value.split(".")[1].toLowerCase()]) {
				throw new Error("The image format is not supported");
			}
			return true;
		}),
	body("location").isString(),
	async (req, res) => {
		const err = validationResult(req);
		if (!err.isEmpty()) {
			return badResponse(res, err.mapped());
		}

		const imageData = req.body;
		let image = null;

		try {
			image = await prisma.image.create({
				data: {
					userId: req.user,
					name: imageData.name,
					fileName: imageData.fileName,
					location: imageData.location,
					metadata: JSON.stringify(imageData.metadata),
				},
			});
		} catch (err) {
			console.log("err :>> ", err);
			return badResponse(res, { status: "could not create DB record" });
		}

		res.status(201).json(image);
		return;
	}
);

routes.get("/", async (req, res) => {
	const images = await prisma.image.findMany({
		where: {
			userId: res.user,
		},
	});

	return res.json(images);
});

export default routes;
