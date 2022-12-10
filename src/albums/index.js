import prisma from "../prisma.js";
import express from "express";
import {
	badResponse,
	serverError,
	unauthResponse,
} from "../utils/errorResponses.js";
import jwt from "jsonwebtoken";

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
				name: true,
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
			...album,
			images,
		});
	} catch (exception) {
		console.log(exception);
		return serverError(res);
	}
});

route.post("/create", async (req, res) => {
	//create an album
	const userid = req.user;

	if (
		!req.body ||
		!req.body ||
		!req.body.name ||
		!req.body.images ||
		!req.body.cover ||
		req.body.error
	)
		return badResponse(res);

	try {
		const coverImage = await prisma.image.findUnique({
			where: { id: req.body.cover },
			select: { fileName: true },
		});

		const album = await prisma.album.create({
			data: {
				userId: userid,
				name: req.body.name,
				cover: coverImage.fileName,
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
