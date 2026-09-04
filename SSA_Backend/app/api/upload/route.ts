import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { authMiddleware } from '../../../src/modules/auth/middlewares/auth.middleware';

// Helper to get configured Cloudinary instance
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'sbsymyo4';
  const apiKey = process.env.CLOUDINARY_API_KEY || '421495547388578';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'UMYh-b3HhK521tbFiwtDz1diR8k';

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return cloudinary;
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const targetFolder = (formData.get('folder') as string) || process.env.CLOUDINARY_FOLDER || 'project_drawings';

      if (!file) {
        return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
      }

      // Convert Next.js File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const isImageOrPdf = file.type.startsWith('image/') || file.type === 'application/pdf' || /\.(png|jpg|jpeg|webp|gif|svg|pdf)$/i.test(file.name);
      const resourceType = isImageOrPdf ? 'auto' : 'raw';

      const cloudinaryInstance = getCloudinary();

      // Upload to Cloudinary using stream into designated folder
      const result = await new Promise<any>((resolve, reject) => {
        cloudinaryInstance.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: targetFolder,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              console.error('[UploadRoute] Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        name: file.name,
        size: file.size,
        type: file.type,
        publicId: result.public_id,
        folder: targetFolder,
      });
    } catch (err: any) {
      console.error('[UploadRoute] Upload handler error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  });
}
