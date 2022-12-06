export const badResponse = (res, error) => {
	res.status(400).json(error ? error : { status: "bad request" });
};

export const unauthResponse = (res) => {
	res.status(401).json({ status: "unauthorized" });
};

export const serverError = (res) => {
	res.status(500).json({ status: "internal server error" });
}