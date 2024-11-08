import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath,resource_type="image") => {
  try {
    if(!filePath) return null
    const uploadResult = await cloudinary.uploader.upload(filePath,{resource_type});
    fs.unlinkSync(filePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(filePath);
    return null;
  }
};

export { uploadOnCloudinary };
