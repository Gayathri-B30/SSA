import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { authMiddleware } from '../../../src/modules/auth/middlewares/auth.middleware';

// Initialize Cloudinary configuration if environment variables are set
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[UploadRoute] Cloudinary configured successfully.');
} else {
  console.warn('[UploadRoute] Cloudinary environment variables are missing. Using local filesystem fallback.');
}

export async function POST(req: NextRequest) {
  return await authMiddleware(req, async (user: any) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
      }

      // Convert Next.js File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary using stream
        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'lead_documents',
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
        });
      } else {
        // Fallback: Upload to local public/uploads directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const sanitizedFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, sanitizedFileName);
        
        fs.writeFileSync(filePath, buffer);

        // Since it is saved in public/uploads, it can be served as /uploads/filename
        const fileUrl = `/uploads/${sanitizedFileName}`;

        return NextResponse.json({
          success: true,
          url: fileUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          fallback: true,
        });
      }
    } catch (err: any) {
      console.error('[UploadRoute] Upload handler error:', err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  });
}
