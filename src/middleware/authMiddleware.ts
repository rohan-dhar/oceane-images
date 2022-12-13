import jwt from "jsonwebtoken";
import { unauthResponse } from "../utils/errorResponses";

const secret = process.env.JWT_SECRET || "EMPTY_SECRET";

const authMiddleware = (req: any, res: any, next: any) => {
	let token = req.headers["authorization"];

	if (!token) return unauthResponse(res);
	token = token.substring(7);

	jwt.verify(token, secret, function (err: any, payload: any) {
		if (err || !payload?.userid) return unauthResponse(res);
		req.token = token;
		req.tokenPayload = payload;
		req.user = payload.userid;
	});
	next();
};

export default authMiddleware;
