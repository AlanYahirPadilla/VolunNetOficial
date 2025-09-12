// Archivo: app/api/sign-image/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// La función se debe llamar POST para manejar peticiones de este tipo
export async function POST(request: Request) {
  console.log("--- Variables leídas en el servidor (API Route) ---");
  console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  console.log("API Key:", process.env.CLOUDINARY_API_KEY);
  console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Cargado" : "NO CARGADO O VACÍO");
  console.log("--------------------------------------------------");
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
      },
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({ signature, timestamp });
  } catch (error) {
    console.error('Error al firmar la petición de subida:', error);
    return NextResponse.json(
      { message: 'No se pudo firmar la petición de subida' },
      { status: 500 }
    );
  }
}