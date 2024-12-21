import { Attachment } from '@/types';
import { createBrowserClient } from '@supabase/ssr';
import { nanoid } from 'nanoid';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function uploadFile(
  file: File,
  bucket = 'attachments'
): Promise<Attachment> {
  const supabase = createClient();

  // Validate file size (10MB limit)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error(
      `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    );
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  // Validate file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
  if (!ext || !allowedExtensions.includes(ext)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
    );
  }

  const path = `${nanoid()}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      url: publicUrl,
      contentType: file.type,
      name: file.name,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload file'
    );
  }
}

export async function deleteFile(path: string, bucket = 'attachments') {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw error;
  }
}
