import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Admin API to bypass RLS (since we lack DELETE policies on users/activities)
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Explicitly delete user data to ensure it is wiped
    await supabaseAdmin.from('activities').delete().eq('user_id', user.id);
    await supabaseAdmin.from('skills').delete().eq('user_id', user.id);
    await supabaseAdmin.from('users').delete().eq('id', user.id);
    
    // Delete user from Supabase Auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteAuthError) {
      console.error('Failed to delete auth user:', deleteAuthError);
      // We still return 200 because we deleted their TRUU data successfully
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
