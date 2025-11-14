import { NextRequest, NextResponse } from 'next/server';
import { simpleAIService } from '@/lib/services/SimpleAIService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userProfile, events } = body;

    if (!userProfile || !events) {
      return NextResponse.json(
        { error: 'Missing required parameters: userProfile and events' },
        { status: 400 }
      );
    }

    console.log('🤖 Generando recomendaciones de IA en el servidor...');
    console.log(`📊 Perfil del usuario: ${userProfile.id}`);
    console.log(`📋 Eventos a procesar: ${events.length}`);

    // Generar recomendaciones usando el servicio de IA
    const recommendations = await simpleAIService.generateAIRecommendations(userProfile, events);

    console.log(`✅ Recomendaciones generadas: ${recommendations.length}`);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error generating AI recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI recommendations',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
