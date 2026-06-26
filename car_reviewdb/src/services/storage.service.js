import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js"; // This is the s3 client we made earlier

export const StorageService = {
  async uploadImage(path, file) {
    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: path,           
      Body: file.buffer,   
      ContentType: file.mimetype, 
    };

    try {
  
      await s3.send(new PutObjectCommand(params));

      return `https://${process.env.B2_BUCKET_NAME}.${process.env.B2_ENDPOINT}/${path}`;
    } catch (err) {
      console.error("Backblaze Upload Error:", err);
      throw new Error("Failed to upload image to Backblaze");
    }
  }
};