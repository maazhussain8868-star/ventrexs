import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user via cookies or Bearer token
    let user: any = null;

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, '');

    if (bearerToken) {
      try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.auth.getUser(bearerToken);
        if (!error && data?.user) {
          user = data.user;
        }
      } catch {
        // Fall through to cookie auth
      }
    }

    if (!user) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user) {
          user = data.user;
        }
      } catch {
        // Fall through
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to update profile picture. Please log in.' },
        { status: 401 }
      );
    }

    // 2. Parse uploaded multipart/form-data
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: 'Invalid form data submission.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided in request.' },
        { status: 400 }
      );
    }

    // 3. Validate file size and mime type
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit. Please upload a smaller image.' },
        { status: 400 }
      );
    }

    const mimeType = file.type?.toLowerCase() || '';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a JPG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 4. Ensure 'avatars' storage bucket exists and is public
    try {
      const { data: bucket, error: bucketCheckError } = await adminClient.storage.getBucket('avatars');
      if (bucketCheckError || !bucket) {
        await adminClient.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
      }
    } catch {
      // Ignore if already created
    }

    // 5. Determine file extension
    let extension = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
    else if (mimeType.includes('webp')) extension = 'webp';

    const timestamp = Date.now();
    const filePath = `${user.id}/avatar-${timestamp}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 6. Upload file to Supabase Storage
    const { error: uploadError } = await adminClient.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('[AVATAR_UPLOAD_ERROR]', uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 7. Generate public URL
    const { data: urlData } = adminClient.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 8. Persist publicUrl to profiles database table
    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileUpdateError) {
      console.warn('[AVATAR_PROFILE_DB_WARN] Failed to update profiles table directly:', profileUpdateError);
      // Attempt upsert in case profile row doesn't exist yet
      await adminClient.from('profiles').upsert({
        id: user.id,
        name: user.user_metadata?.name || 'Owner',
        email: user.email || '',
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // 9. Sync user_metadata on auth.users for fast token payload resolution
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          avatar_url: publicUrl,
        },
      });
    } catch (metadataErr) {
      console.warn('[AVATAR_AUTH_METADATA_WARN]', metadataErr);
    }

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during avatar upload.';
    console.error('[AVATAR_SERVER_ERROR]', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
