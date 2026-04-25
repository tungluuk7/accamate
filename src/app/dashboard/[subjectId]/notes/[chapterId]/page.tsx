"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, Edit3 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function NotesPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;

  const [noteData, setNoteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        // Lấy bài note dựa trên ID của chương
        const { data, error } = await supabase
          .from('knowledge_notes')
          .select('*')
          .eq('chapter_id', chapterId)
          .single(); // Mỗi chương chỉ lấy 1 bài note chính

        if (error && error.code !== 'PGRST116') throw error; // Bỏ qua lỗi nếu chưa có dữ liệu
        if (data) setNoteData(data);
      } catch (error) {
        console.error("Lỗi khi tải sổ tay:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [chapterId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark">
        <Loader2 className="w-10 h-10 animate-spin text-acca" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-background-dark transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <div className="bg-background dark:bg-surface-dark border-b border-border dark:border-border-dark px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => router.push(`/dashboard/${subjectId}`)}
          className="flex items-center gap-2 text-text-secondary hover:text-acca transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {subjectId}</span>
        </button>
        <div className="flex items-center gap-2 font-bold text-text-primary dark:text-text-darkPrimary">
          <BookOpen className="w-5 h-5 text-acca" />
          <span>Chapter Notebook</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-3xl">
          
          {!noteData ? (
            <div className="bg-background dark:bg-surface-dark p-12 rounded-md border border-border dark:border-border-dark text-center shadow-sm">
              <Edit3 className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-text-primary dark:text-text-darkPrimary mb-2">No notes available yet</h2>
              <p className="text-text-secondary dark:text-text-darkSecondary mb-6">
                Theory and summaries for this chapter haven't been added.
              </p>
            </div>
          ) : (
            <div className="bg-background dark:bg-surface-dark p-8 md:p-12 rounded-md border border-border dark:border-border-dark shadow-sm">
              <h1 className="text-3xl font-black text-text-primary dark:text-text-darkPrimary mb-6 pb-6 border-b border-border dark:border-border-dark">
                {noteData.title}
              </h1>
              
              {/* Thẻ div này dùng whitespace-pre-wrap để giữ nguyên các dòng ngắt quãng (Enter) từ Database */}
              <div className="text-text-primary dark:text-text-darkPrimary leading-relaxed whitespace-pre-wrap text-lg">
                {noteData.content}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}