import prisma from "../prisma.js";
import express from "express";
import {
	badResponse,
	serverError,
	unauthResponse,
} from "../utils/errorResponses.js";
import imageTypes from "../utils/imageTypes.js";
import { body, validationResult } from "express-validator";

const route = express();

route.get("/", async (req, res) => {
	//get all albums for a user
	const userid = req.user;

	try {
		const albums = await prisma.album.findMany({
			where: {
				userId: userid,
			},
			select: {
				id: true,
				name: true,
				createdAt: true,
				cover: true,
			},
		});
		console.log(albums);
		return res.json({
			status: "albums returned",
			albums,
		});
	} catch (exception) {
		console.log(exception);
		return serverError(res);
	}
});

route.get("/:albumid", async (req, res) => {
	try {
		//get all images for an album
		const album = await prisma.album.findUnique({
			where: {
				id: req.params.albumid,
			},
			select: {
				userId: true,
			},
		});

		if (!album) return badResponse(res);
		if (album.userId != req.user) return unauthResponse(res);

		const images = await prisma.image.findMany({
			where: {
				albums: {
					some: { albumId: req.params.albumid },
				},
			},
		});

		console.log(images);
		return res.json({
			status: "images for album returned",
			images,
		});
	} catch (exception) {
		console.log(exception);
		return serverError(res);
	}
});

route.post(
	"/create", 
	body("name").isString(),
	body("images").isArray(),
	body("cover")
		.isString()
		.custom((value) => {
			if (!imageTypes[value.split(".")[1].toLowerCase()]) {
				throw new Error("The image format is not supported");
			}
			return true;
		}),
	async (req, res) => {
		const err2 = validationResult(req);
		if(!err2.isEmpty() || req.err) {
			return badResponse(res, err2.mapped());
		}

		const userid = req.user;

		try {
			const album = await prisma.album.create({
				data: {
					userId: userid,
					name: req.body.name,
					cover: req.body.cover,
				},
			});

			for (let img of req.body.images) {
				await prisma.albumImages.create({
					data: {
						albumId: album.id,
						imageId: img,
					},
				});
			}
			return res.json({
				status: "album created",
				albumId: album.id,
			});
		} catch (exception) {
			console.log(exception);
			return serverError(res);
		}
});

route.delete("/:albumid", async (req, res) => {
	//delete an album
	try {
		const album = await prisma.album.findUnique({
			where: {
				id: req.params.albumid,
			},
			select: {
				userId: true,
			},
		});

		if (!album) return badResponse(res);
		if (album.userId != getUserId(req.headers["authorization"]))
			return unauthResponse(res);

		await prisma.album.delete({
			where: {
				id: req.params.albumid,
			},
		});

		return res.json({
			status: "album deleted",
		});
	} catch (exception) {
		console.log(exception);
		return serverError(res);
	}
});

export default route;
