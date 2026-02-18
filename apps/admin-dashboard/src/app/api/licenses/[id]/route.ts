export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .select(`
        *,
        users:user_id (id, email, full_name),
        license_activations (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ license });
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive, tier, maxMachines, expiresAt } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof isActive === 'boolean') {
      updates.is_active = isActive;
    }
    if (tier) {
      updates.tier = tier;
    }
    if (typeof maxMachines === 'number') {
      updates.max_machines = maxMachines;
    }
    if (expiresAt) {
      updates.expires_at = expiresAt;
    }

    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ license });
  } catch (error) {
    console.error('Error updating license:', error);
    return NextResponse.json(
      { error: 'Failed to update license' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete - just deactivate
    const { error } = await supabaseAdmin
      .from('licenses')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting license:', error);
    return NextResponse.json(
      { error: 'Failed to delete license' },
      { status: 500 }
    );
  }
}
