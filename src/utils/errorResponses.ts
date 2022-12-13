export const badResponse = (res: any, error: any) => {
	res.status(400).json(error ? error : { status: "bad request" });
};

export const unauthResponse = (res: any) => {
	res.status(401).json({ status: "unauthorized" });
};

export const serverError = (res: any) => {
	res.status(500).json({ status: "internal server error" });
}

export const invalidUser = (res: any) => {
	res.status(404).json({ status: "user does not exist or is invalid" });
}

export const actionAlreadyPerformed = (res: any) => {
	res.status(404).json({ status: "album already shared with user" });
}