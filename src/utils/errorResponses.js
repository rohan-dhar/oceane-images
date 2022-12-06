export const badResponse = (res, error) => {
	res.status(400).json(error ? error : { status: "bad request" });
};

export const unauthResponse = (res) => {
	res.status(401).json({ status: "unauthorized" });
};
