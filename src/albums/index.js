import prisma from "../prisma.js"
import express from "express"
import { badResponse, serverError, unauthResponse } from "../utils/errorResponses.js"
import jwt from "jsonwebtoken"

const route = express()

function getUserId(bearer_header) {
    const token = bearer_header.substring(7)
    var decoded = jwt.decode(token);
    console.log(decoded)
    return decoded.userid? decoded.userid : decoded.id;
}

route.get("/", async(req, res) => {
    //get all albums for a user
    const userid = getUserId(req.headers["authorization"])

    try {
        const albums = await prisma.album.findMany({
            where: {
                userId: userid
            }, 
            select: {
                id: true,
                name: true,
                createdAt: true,
                coverPicture: true,
            }
        })
        console.log(albums)
        return res.json({ 
            status: "albums returned",
            albums 
        });

    } catch (exception) {
        console.log(exception)
        return serverError(res)
    }
})

route.get("/:albumid", async(req, res) => { 
    try {
        //first check if the album belongs to the user
        const album = await prisma.album.findUnique({
            where: {
                id: req.params.albumid
            },
            select: {
                userId: true
            }
        })

        if (!album) return badResponse(res)
        if (album.userId != getUserId(req.headers["authorization"])) return unauthResponse(res)

        const images = await prisma.image.findMany({
            where: {
                albums: {
                    some: { albumId: req.params.albumid }
                }
            }
        })

        console.log(images)
        return res.json({ 
            status: "images for album returned",
            images
        });

    } catch(exception) {
        console.log(exception)
        return serverError(res)
    }
})

route.post("/create", async(req, res) => {
    const userid = getUserId(req.headers["authorization"])

    if (!req.body || !req.body || !req.body.name || !req.body.images || !req.body.cover || req.body.error) 
        return badResponse(res)

    try {
        const album = await prisma.album.create({
            data: {
                userId: userid,
                name: req.body.name,
                coverPicture: req.body.cover
            }
        })

        for (let img of req.body.images) {
            await prisma.albumImages.create({
                data: {
                    albumId: album.id,
                    imageId: img
                }
            })
        }
        return res.json({ 
            status: "album created", 
            albumId: album.id 
        });
    }
    catch (exception) {
        console.log(exception)
        return serverError(res)
    }
})

//delete album also add
route.delete("/:albumid", async(req, res) => {
    try {
        //first check if the album belongs to the user
        const album = await prisma.album.findUnique({
            where: {
                id: req.params.albumid
            },
            select: {
                userId: true
            }
        })

        if (!album) return badResponse(res)
        if (album.userId != getUserId(req.headers["authorization"])) return unauthResponse(res)

        await prisma.album.delete({
            where: {
                id: req.params.albumid
            }
        })

        return res.json({ 
            status: "album deleted"
        });

    } catch(exception) {
        console.log(exception)
        return serverError(res)
    }
})

export default route;
