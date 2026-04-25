"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// Các công cụ biến Text thành Word & Toán học
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Quan trọng: Đừng quên CSS của KaTeX

export default function ChapterNotesPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChapterInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .single();

        if (error) throw error;
        setChapter(data);
      } catch (error) {
        console.error("Lỗi tải lý thuyết:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChapterInfo();
  }, [chapterId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark"><Loader2 className="w-10 h-10 animate-spin text-acca" /></div>;
  if (!chapter) return <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-background-dark"><h2>Chapter not found!</h2><button onClick={() => router.back()} className="text-acca mt-4">Go back</button></div>;

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark p-4 md:p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark shadow-sm sticky top-4 z-10">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface dark:hover:bg-background-dark rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-text-secondary" />
          </button>
          <div>
            <div className="text-acca text-sm font-bold uppercase tracking-wider mb-1">{subjectId} Notebook</div>
            <h1 className="text-2xl font-black text-text-primary dark:text-text-darkPrimary flex items-center gap-3">
              <BookOpen className="text-acca w-6 h-6" /> {chapter.title}
            </h1>
          </div>
        </div>

        {/* Khung chứa Lý thuyết (như trang giấy trắng) */}
        <div className="bg-background dark:bg-surface-dark p-8 md:p-12 rounded-md border border-border dark:border-border-dark shadow-sm">
          
          {/* NẾU KHÔNG CÓ NỘI DUNG */}
          {!chapter.theory_content ? (
            <div className="text-center py-20 text-text-secondary italic">
              Theory content for this chapter is empty. Please add content in Supabase.
            </div>
          ) : (
            /* SỨC MẠNH CỦA TAILWIND TYPOGRAPHY NẰM Ở CLASS "prose" */
            <div className="prose prose-lg dark:prose-invert prose-headings:text-acca prose-a:text-blue-600 max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {chapter.theory_content}
              </ReactMarkdown>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}