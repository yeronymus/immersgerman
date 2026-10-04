import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Retrieve the list of pending (ai_reviewed) videos for moderation
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .table('videos')
      .select('*, channels(title, thumbnail_url)')
      .eq('status', 'ai_reviewed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ videos: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Approve / Publish a video (and optionally override CEFR level and tags)
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, cefr_level, grammar_tags } = body;

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const updateData = {
      status: 'published'
    };

    if (cefr_level) {
      updateData.cefr_level = cefr_level;
    }
    if (grammar_tags) {
      updateData.grammar_tags = grammar_tags;
    }

    const { data, error } = await supabaseAdmin
      .table('videos')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, video: data[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete (reject) a video from the database
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .table('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
