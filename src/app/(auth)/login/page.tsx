"use client";

import { LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
        router.refresh(); // Làm mới để Middleware cập nhật quyền truy cập
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
  
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Sau khi đăng nhập thành công, tự động chuyển về dashboard
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Login error:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-background dark:bg-surface-dark rounded-md shadow-sm border border-border dark:border-border-dark flex flex-col items-center">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-darkPrimary mb-2">
            AccaMate
          </h1>
          <p className="text-sm text-text-secondary dark:text-text-darkSecondary">
            Personalized ACCA Study Hub
          </p>
        </div>

        {/* Đã thêm type="button" để ngăn chặn hành động submit mặc định sinh ra lỗi dấu # */}
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-acca hover:bg-acca-dark text-white py-3 px-4 rounded transition-colors font-medium"
        >
          <LogIn className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>
        
      </div>
    </div>
  );
}