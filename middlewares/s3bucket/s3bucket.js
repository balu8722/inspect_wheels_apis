const aws = require("aws-sdk")
const multer = require('multer');
const { ENV_DATA } = require("../../config/config");
const { _serverErrorMsg } = require("../../utils/common");
const sharp = require('sharp');

const uploads = multer({ dest: 'uploads/' });

const s3 = new aws.S3({
    accessKeyId: ENV_DATA.S3BUCKET_ACCESSKEY,
    secretAccessKey: ENV_DATA.S3BUCKET_SECRETACCESSKEY,
    region: ENV_DATA.S3BUCKET_REGION
});

const deleteObjectByUrl = async (res, imageUrl) => {
    try {
        // Extract the key from the URL
        const urlParts = imageUrl.split('/');
        const key = decodeURIComponent(urlParts[urlParts.length - 1]);
        // console.log("🚀 ~ module.exports.deleteObjectByUrl ~ key:", key)

        // Delete object from S3 bucket
        await s3.deleteObject({ Bucket: ENV_DATA.S3BUCKET_NAME, Key: key }).promise();
        // console.log('Object deleted from S3 bucket');
    } catch (error) {
        console.log('error while deleting previous s3 bucket image');
    }
}

// Function to compress image to below 500KB
const compressImage = async (res, filePath) => {
    try {
        let quality = 90;
        let compressedImage = await sharp(filePath)
            .jpeg({ quality })
            .toBuffer();

        // console.log("🚀 ~ compressImage ~ compressedImage:", compressedImage.length)
        // Iterate until file size is below 500KB
        while ((compressedImage.length > (500 * 1024)) && (quality >= 10)) {
            quality -= 10;
            compressedImage = await sharp(filePath)
                .jpeg({ quality })
                .toBuffer();
        }

        return compressedImage;
    } catch (error) {
        // console.log("🚀 ~ compressImage ~ error:", error)
        return _serverErrorMsg(res, error)
    }
}


module.exports = { s3, uploads, deleteObjectByUrl, compressImage }