import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';
import { v2 as cloudinary } from 'cloudinary'; // Example: Using Cloudinary for image upload

// Configure Cloudinary (replace with your credentials)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image to Cloudinary
async function uploadImage(buffer) {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'debates' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    return result.secure_url; // Return the image URL
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');
    let imageUrl = null;

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadImage(buffer);
    }

    // Parse form data fields
    const title = formData.get('title');
    const description = formData.get('description');
    const tags = JSON.parse(formData.get('tags')); // Parse JSON string back to array
    const category = formData.get('category');
    const duration = parseInt(formData.get('duration'));
    const creatorId = formData.get('creatorId');
    const endsAt = new Date(formData.get('endsAt'));

    // Validate required fields
    if (!title || !description || !category || !creatorId || !endsAt) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Create debate in Prisma
    const debate = await prisma.debate.create({
      data: {
        title,
        description,
        tags,
        category,
        image: imageUrl, // Use uploaded image URL
        duration,
        creatorId,
        endsAt,
      },
    });

    return new Response(JSON.stringify(debate), { status: 200 });
  } catch (error) {
    // console.error('Error creating debate:', error);
    return new Response(JSON.stringify({ error: 'Failed to create debate' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const debates = await prisma.debate.findMany({
      include: { creator: true },
    });
    return new Response(JSON.stringify(debates), { status: 200 });
  } catch (error) {
    // console.error('Error fetching debates:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch debates' }), { status: 500 });
  }
}