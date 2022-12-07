import jwt from "jsonwebtoken";
import { unauthResponse } from "../utils/errorResponses.js";

const secret = process.env.JWT_SECRET || "EMPTY_SECRET";

const authMiddleware = (req, res, next) => {
	let token = req.headers["authorization"];

	if (!token) return unauthResponse(res);
	token = token.substring(7);

	jwt.verify(token, secret, function (err, payload) {
		if (err || !payload?.userid) return unauthResponse(res);
		req.token = token;
		req.tokenPayload = payload;
		req.user = payload.userid;
	});
	next();
};

export default authMiddleware;
