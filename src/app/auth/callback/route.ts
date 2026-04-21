import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Nếu Google trả về mã xác thực code
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Xử lý lỗi an toàn cho Server Components
            }
          },
        },
      }
    );
    
    // Quy đổi mã lấy Session Cookie
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Sau khi đóng dấu Cookie xong, mới cho qua Dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}