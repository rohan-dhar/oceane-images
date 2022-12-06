import jwt from "jsonwebtoken";
import { unauthResponse } from "../utils/errorResponses.js";

const secret = process.env["JWT_SECRET"] || "EMPTY_SECRET";

const authMiddleware = (req, res, next) => {
	let token = req.headers["authorization"];
	console.log("token :>> ", token);
	if (!token) return unauthResponse(res);
	token = token.substring(7);

	jwt.verify(token, secret, function (err, payload) {
		if (err) return unauthResponse(res);
		req.token = token;
		req.tokenPayload = payload;
		next();
	});
};

export default authMiddleware;
