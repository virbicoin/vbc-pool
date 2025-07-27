import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        // プロジェクトルートのpools.jsonを読む
        const poolsPath = path.join(process.cwd(), 'pools.json');
        const data = await fs.readFile(poolsPath, 'utf-8');
        const pools = JSON.parse(data);
        return NextResponse.json(pools);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to load pools.json', details: String(e) }, { status: 500 });
    }
} 