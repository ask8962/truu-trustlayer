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

    // Explicitly delete user data to ensure it is wiped even if CASCADE is not set up perfectly
    await supabase.from('activities').delete().eq('user_id', user.id);
    await supabase.from('skills').delete().eq('user_id', user.id);
    await supabase.from('users').delete().eq('uid', user.id);

    // Delete user from Supabase Auth using the Admin API
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
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
