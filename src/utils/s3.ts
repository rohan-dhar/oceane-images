import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import uuid4 from "uuid4";
import imageTypes from "./imageTypes";

export const accessKey = process.env.AWS_ACCESS_KEY || "";
export const secretKey = process.env.AWS_SECRET_KEY || "";
export const s3Region = process.env.AWS_S3_REGION || "";
export const s3Bucket = process.env.AWS_S3_BUCKET || "";

export const s3Client = new S3Client({
	credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
	region: s3Region,
});

export const S3_URL_EXPIRY_TIME = 10 * 60;

export const makeS3UploadUrl = async (imageType: String) => {
	const extension = imageTypes[imageType as keyof typeof imageTypes];

	const imageName = `${uuid4()}.${extension}`;

	const s3Params = {
		Bucket: s3Bucket,
		Key: imageName,
		ContentType: extension,
	};
	const command = new PutObjectCommand(s3Params);

	try {
		const signedUrl = await getSignedUrl(s3Client, command, {
			expiresIn: S3_URL_EXPIRY_TIME,
		});
		return { uploadUrl: signedUrl, imageName };
	} catch (err) {
		console.log("err :>> ", err);
		return null;
	}
};
