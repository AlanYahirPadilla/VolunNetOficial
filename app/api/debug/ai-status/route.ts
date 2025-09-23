import { NextRequest, NextResponse } from 'next/server';
import { openAIService } from '@/lib/services/OpenAIService';
import { huggingFaceService } from '@/lib/services/HuggingFaceService';
import { googleMapsService } from '@/lib/services/GoogleMapsService';

export async function GET(request: NextRequest) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apis: {
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          keyPresent: process.env.OPENAI_API_KEY ? 
            `${process.env.OPENAI_API_KEY.substring(0, 8)}...` : 'No key',
          testResult: null,
          error: null
        },
        huggingface: {
          configured: !!process.env.HUGGINGFACE_API_KEY,
          keyPresent: process.env.HUGGINGFACE_API_KEY ? 
            `${process.env.HUGGINGFACE_API_KEY.substring(0, 8)}...` : 'No key',
          testResult: null,
          error: null
        },
        googlemaps: {
          configured: !!process.env.GOOGLE_MAPS_API_KEY,
          keyPresent: process.env.GOOGLE_MAPS_API_KEY ? 
            `${process.env.GOOGLE_MAPS_API_KEY.substring(0, 8)}...` : 'No key',
          testResult: null,
          error: null
        }
      }
    };

    // Probar OpenAI si está configurado
    if (process.env.OPENAI_API_KEY) {
      try {
        const testResult = await openAIService.analyzeEventDescription('Test event for API verification');
        results.apis.openai.testResult = 'Success';
      } catch (error: any) {
        results.apis.openai.testResult = 'Failed';
        results.apis.openai.error = error.message;
      }
    }

    // Probar Hugging Face si está configurado
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        const testResult = await huggingFaceService.generateEmbedding('Test text for API verification');
        results.apis.huggingface.testResult = 'Success';
      } catch (error: any) {
        results.apis.huggingface.testResult = 'Failed';
        results.apis.huggingface.error = error.message;
      }
    }

    // Probar Google Maps si está configurado
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const testResult = await googleMapsService.getDistanceMatrix(
          'Guadalajara, Jalisco, Mexico',
          'Zapopan, Jalisco, Mexico'
        );
        results.apis.googlemaps.testResult = 'Success';
      } catch (error: any) {
        results.apis.googlemaps.testResult = 'Failed';
        results.apis.googlemaps.error = error.message;
      }
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error('Error checking AI API status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check API status',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

