import jwt from "jsonwebtoken";

const unauthResponse = (res) => {
	res.json({ status: "unauthorized" });
	res.sendStatus(401);
};

const secret = process.env["JWT_SECRET"] || "EMPTY_SECRET";

const authMiddleware = (req, res, next) => {
	let token = req.headers["authorization"];
	console.log("token :>> ", token);
	if (!token) return unauthResponse(res);
	token = token.substring(7);

	jwt.verify(token, secret, function (err) {
		if (!err) return next();
		return unauthResponse(res);
	});
};

export default authMiddleware;
