"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// Giữ nguyên danh sách tĩnh làm bộ khung
const ACCA_SUBJECTS = [
  { id: 'F1', code: 'BT', name: 'Business and Technology' },
  { id: 'F2', code: 'MA', name: 'Management Accounting' },
  { id: 'F3', code: 'FA', name: 'Financial Accounting' },
  { id: 'F4', code: 'LW', name: 'Corporate and Business Law' },
  { id: 'F5', code: 'PM', name: 'Performance Management' },
  { id: 'F6', code: 'TX', name: 'Taxation' },
  { id: 'F7', code: 'FR', name: 'Financial Reporting' },
  { id: 'F8', code: 'AA', name: 'Audit and Assurance' },
  { id: 'F9', code: 'FM', name: 'Financial Management' },
  { id: 'P1', code: 'SBL', name: 'Strategic Business Leader' },
  { id: 'P2', code: 'SBR', name: 'Strategic Business Reporting' },
  { id: 'P3', code: 'AFM', name: 'Advanced Financial Management' },
  { id: 'P4', code: 'APM', name: 'Advanced Performance Management' },
];

export default function DashboardPage() {
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Lấy tất cả câu hỏi để đếm tổng số câu của mỗi môn
        const { data: allQuestions } = await supabase.from('questions').select('id, subject_id');
        
        // 2. Lấy tất cả câu đúng của user này
        const { data: userCorrectAnswers } = await supabase
          .from('user_progress')
          .select('question_id')
          .eq('user_id', user.id)
          .eq('is_correct', true);

        if (!allQuestions || !userCorrectAnswers) return;

        // Tạo mảng chỉ chứa ID của các câu đúng để dễ tra cứu
        const correctQuestionIds = userCorrectAnswers.map(ans => ans.question_id);

        // 3. Tính toán phần trăm cho từng môn
        const calculatedProgress: Record<string, number> = {};

        ACCA_SUBJECTS.forEach(subject => {
          // Lọc ra các câu hỏi thuộc về môn học hiện tại (VD: F3)
          const subjectQuestions = allQuestions.filter(q => q.subject_id === subject.id);
          const totalQuestions = subjectQuestions.length;

          if (totalQuestions === 0) {
            calculatedProgress[subject.id] = 0; // Chưa có câu hỏi nào thì 0%
          } else {
            // Đếm xem trong số câu của môn này, user làm đúng bao nhiêu câu
            const correctCount = subjectQuestions.filter(q => correctQuestionIds.includes(q.id)).length;
            calculatedProgress[subject.id] = Math.round((correctCount / totalQuestions) * 100);
          }
        });

        setProgressData(calculatedProgress);
      } catch (error) {
        console.error("Lỗi khi tải tiến độ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark">
        <Loader2 className="w-10 h-10 animate-spin text-acca" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-darkPrimary">
            Choose your ACCA subject
          </h1>
          <p className="text-text-secondary dark:text-text-darkSecondary mt-2">
            Keep going on your path!
          </p>
        </div>

        {/* Grid danh sách môn học */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ACCA_SUBJECTS.map((subject) => {
            // Lấy tiến độ thực tế từ State, nếu không có thì mặc định là 0
            const progress = progressData[subject.id] || 0;
            const isStarted = progress > 0;

            return (
              <div 
                key={subject.id}
                className="bg-background dark:bg-surface-dark rounded-md border border-border dark:border-border-dark shadow-sm p-6 flex flex-col hover:border-acca transition-colors duration-200"
              >
                <div className="flex-1">
                  <h2 className="text-4xl font-black text-acca mb-2">
                    {subject.id}
                  </h2>
                  <h3 className="text-lg font-medium text-text-primary dark:text-text-darkPrimary leading-tight mb-1">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-text-darkSecondary font-medium">
                    ({subject.code})
                  </p>
                </div>

                <div className="mt-6">
                  {/* Thanh tiến trình chạy theo % thực tế */}
                  <div className="w-full bg-surface dark:bg-background-dark rounded-full h-2 mb-4 border border-border dark:border-border-dark overflow-hidden">
                    <div 
                      className="bg-acca h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <Link 
                    href={`/dashboard/${subject.id}`}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded font-medium transition-colors ${
                      isStarted 
                        ? 'bg-acca hover:bg-acca-dark text-white' 
                        : 'bg-transparent border-2 border-acca text-acca hover:bg-acca-light dark:hover:bg-background-dark'
                    }`}
                  >
                    {isStarted ? (
                      <>
                        <PlayCircle className="w-5 h-5" />
                        <span>Continue ({progress}%)</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        <span>Start</span>
                      </>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}