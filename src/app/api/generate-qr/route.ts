import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.TABLE_SECRET || 'pos-web-table-secret-2024-change-in-production';
const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://siteweb-resto.vercel.app';

export async function GET(req: NextRequest) {
  const tableId = req.nextUrl.searchParams.get('tableId');

  if (!tableId) {
    return NextResponse.json({ success: false, message: 'tableId requis' }, { status: 400 });
  }

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(tableId)
    .digest('hex')
    .substring(0, 16);

  const url = `${DOMAIN}/call?t=${tableId}&s=${signature}`;

  return NextResponse.json({ success: true, data: { url, tableId, signature } });
}
