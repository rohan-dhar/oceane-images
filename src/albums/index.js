import prisma from "../prisma.js"
import express from "express"
import { badResponse, serverError } from "../utils/errorResponses.js"
import jwt from "jsonwebtoken"

const route = express()

function getUserId(jwt_token) {
    var decoded = jwt.decode(jwt_token);
    console.log(decoded)
    return decoded.userid? decoded.userid : decoded.id;
}

route.post("/create", async(req, res) => {
    const bearer_header = req.headers["authorization"]
    const token = bearer_header.substring(7)
    const userid = getUserId(token)

    if (!req.body || !req.body || !req.body.name || !req.body.images || req.body.error) 
        return badResponse(res)

    //create an album
    try {
        const album = await prisma.album.create({
            data: {
                userId: userid,
                name: req.body.name,
            }
        })

        for (let img in req.body.images) {
            await prisma.albumImages.create({
                data: {
                    albumId: album.id,
                    imageId: img
                }
            })
        }
        return res.json({ status: "album created successfully", albumId: album.id });
    }
    catch (exception) {
        console.log(exception)
        return serverError(res)
    }

})

export default route;
