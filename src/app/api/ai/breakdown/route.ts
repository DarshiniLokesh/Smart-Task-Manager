import { NextResponse } from 'next/server';
import { AiBreakdownSchema } from '@/lib/validations/task';
import { generateSubtasksBreakdown } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = AiBreakdownSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description } = validation.data;
    const result = await generateSubtasksBreakdown(title, description);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating AI task breakdown:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate task breakdown' },
      { status: 500 }
    );
  }
}
