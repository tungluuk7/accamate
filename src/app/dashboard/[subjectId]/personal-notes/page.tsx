"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookHeart, Loader2, Pin, Calendar, Edit3 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function PersonalNotesPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [notesData, setNotesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalNotes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Kéo dữ liệu các câu có ghi chú (không được rỗng)
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('question_id, personal_note, last_attempted')
          .eq('user_id', user.id)
          .not('personal_note', 'is', null)
          .neq('personal_note', '');

        if (!progressData || progressData.length === 0) {
          setNotesData([]);
          setIsLoading(false);
          return;
        }

        const questionIds = progressData.map(p => p.question_id);

        // 2. Kéo nội dung câu hỏi tương ứng với các ghi chú đó
        const { data: questionsData } = await supabase
          .from('questions')
          .select('id, content, question_type, explanation')
          .eq('subject_id', subjectId)
          .in('id', questionIds);

        if (questionsData) {
          // Lắp ghép ghi chú vào câu hỏi
          const combined = progressData.map(p => {
            const q = questionsData.find(q => q.id === p.question_id);
            return { ...p, question: q };
          }).filter(item => item.question);

          // Sắp xếp ghi chú mới nhất lên đầu
          combined.sort((a, b) => new Date(b.last_attempted).getTime() - new Date(a.last_attempted).getTime());

          setNotesData(combined);
        }
      } catch (error) {
        console.error("Lỗi tải ghi chú cá nhân:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalNotes();
  }, [subjectId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark"><Loader2 className="w-10 h-10 animate-spin text-acca" /></div>;

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface dark:hover:bg-background-dark rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-text-secondary" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-text-primary dark:text-text-darkPrimary flex items-center gap-3">
                <BookHeart className="text-[#EAB308]" /> Personal Notebook
              </h1>
              <p className="text-text-secondary mt-1">Your personal mnemonics and custom tips.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {notesData.length === 0 ? (
          <div className="bg-background dark:bg-surface-dark p-12 rounded-md border border-border dark:border-border-dark text-center shadow-sm">
            <Edit3 className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-text-primary dark:text-text-darkPrimary mb-2">No personal notes yet</h2>
            <p className="text-text-secondary mb-6">Start practicing and pin your own tips to questions!</p>
            <button onClick={() => router.push(`/dashboard/${subjectId}`)} className="text-acca hover:underline font-medium">Go back to Dashboard</button>
          </div>
        ) : (
          <div className="grid gap-6">
            {notesData.map((item, index) => (
              <div key={index} className="bg-background dark:bg-surface-dark rounded-md border border-border dark:border-border-dark shadow-sm overflow-hidden">
                
                {/* Sticky Note Giao diện Vàng */}
                <div className="bg-[#FEF9C3] dark:bg-[#713F12] p-6 border-b border-[#FDE047] dark:border-[#854D0E]">
                  <div className="flex items-start gap-3">
                    <Pin className="w-5 h-5 text-[#CA8A04] dark:text-[#FDE047] shrink-0 mt-1" />
                    <div className="text-[#854D0E] dark:text-[#FEF9C3] text-lg font-medium whitespace-pre-wrap leading-relaxed">
                      {item.personal_note}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs text-[#A16207] dark:text-[#FDE047] opacity-70 ml-8">
                    <Calendar className="w-3 h-3" />
                    Last updated: {new Date(item.last_attempted).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Câu hỏi gốc để đối chiếu */}
                <div className="p-6">
                  <div className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Original Question Context</div>
                  <div className="text-text-primary dark:text-text-darkPrimary font-medium opacity-80 leading-relaxed mb-4 italic">
                    "{item.question.content}"
                  </div>
                  {item.question.explanation && (
                    <div className="p-4 bg-surface dark:bg-background-dark rounded text-sm text-text-secondary border border-border dark:border-border-dark">
                      <span className="font-bold mr-2 text-acca">System Explanation:</span>
                      {item.question.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}