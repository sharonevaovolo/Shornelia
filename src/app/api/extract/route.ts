import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Passthrough the original FormData directly to n8n webhook
    const formData = await request.formData();

    // Get count of files
    const count = parseInt(formData.get('count') as string || '0');

    if (count === 0) {
      return NextResponse.json(
        { error: 'No PDF files provided' },
        { status: 400 }
      );
    }

    // Validate all files are PDFs
    for (let i = 0; i < count; i++) {
      const file = formData.get(`file${i}`) as File;
      if (!file || file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `File ${i+1} must be a PDF document` },
          { status: 400 }
        );
      }
      console.log(`📄 File ${i+1}: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    console.log(`📤 Forwarding ${count} PDF files directly to n8n webhook for extraction & OCR...`);

    // Forward the complete original FormData with all files directly to n8n
    const webhookResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      body: formData
    });

    if (webhookResponse.ok) {
      const result = await webhookResponse.json();
      console.log('✅ Received response from n8n webhook');

      return NextResponse.json({
        success: true,
        ...result
      });
    } else {
      console.error('❌ Webhook returned error status:', webhookResponse.status, webhookResponse.statusText);
      throw new Error(`Webhook failed with status ${webhookResponse.status}`);
    }

  } catch (error) {
    console.error('💥 Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file' },
      { status: 500 }
    );
  }
}
