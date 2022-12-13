 // @ts-nocheck comment

import prisma from "../utils/prisma";
import express from "express";
import {
	actionAlreadyPerformed,
	badResponse,
	invalidUser,
	serverError,
	unauthResponse,
} from "../utils/errorResponses";
import { body, validationResult } from "express-validator";
import { Album, Prisma } from "@prisma/client";

const route = express();

// GET /albums
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


// GET /albums/shared
route.get("/shared", async(req, res) => {
	//get all albums shared with the user.
	try{
		const sharedalbums = await prisma.albumShares.findMany({
			where: { userId: req.user },
			select: {
				album: {
					select: {
						id: true,
						name: true,
						createdAt: true,
						cover: true
					}
				}
			}
		})

		let albums: Album | any = []
		sharedalbums.forEach(item => {
			albums.push(item["album"])
		})

		return res.status(200).json({
			status:"shared albums returned",
			albums
		});
	} catch(exception) {
		console.log(exception)
		return serverError(res);
	}
});


// GET /albums/ALBUMID
route.get("/:albumid", async (req, res) => {
	try {

		//get all images for an album. 

		const isAlbumOwner = await prisma.album.findFirst({
			where: {
				id: req.params.albumid,
				userId: req.user
			},
			select: { name: true },
		})
		.then(r => Boolean(r))

		const isAlbumShared = await prisma.albumShares.findFirst({
			where: {
				albumId: req.params.albumid,
				userId: req.user
			}, 
		})
		.then(r => Boolean(r))

		if (!isAlbumOwner && !isAlbumShared) return unauthResponse(res);

		const images = await prisma.image.findMany({
			where: {
				albums: {
					some: { albumId: req.params.albumid },
				},
			},
		});

		return res.json({
			status: "images for album returned",
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
		return badResponse(res, null);

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


// DELETE /albums/ALBUMID
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

		if (!album) return badResponse(res, null);
		if (album.userId != req.user) return unauthResponse(res);

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


// POST /albums/ALBUMID/share
route.post(
	"/:albumid/share",
	body("email")
	.isString(),
	async (req, res) => {
		const err = validationResult(req);
		if (!err.isEmpty()) {
			return badResponse(res, err.mapped());
		}

		try{ 
			const shareduser = await prisma.user.findUnique({
				where: { email: req.body.email }, 
				select: { id: true }
			})

			if (!shareduser || shareduser.id===req.user) return invalidUser(res);

			await prisma.albumShares.create({
				data: {
					albumId: req.params.albumid,
					userId: shareduser.id
				}
			})
			return res.json({
				status: "album shared",
			});
		} catch(exception) {
			console.log(exception);
			if (exception instanceof Prisma.PrismaClientKnownRequestError) {
				return actionAlreadyPerformed(res);
			}
			return serverError(res);
		}
	}
);


export default route;
