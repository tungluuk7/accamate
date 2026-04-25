"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Calculator, Clock, AlertCircle, FileText, Settings, PlayCircle, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const SUBJECT_NAMES: Record<string, string> = {
  F1: 'Business and Technology',
  F2: 'Management Accounting',
  F3: 'Financial Accounting',
  F4: 'Corporate and Business Law',
  F5: 'Performance Management',
  F6: 'Taxation',
  F7: 'Financial Reporting',
  F8: 'Audit and Assurance',
  F9: 'Financial Management',
};

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const subjectName = SUBJECT_NAMES[subjectId] || 'Unknown Subject';

  const [activeTab, setActiveTab] = useState('notebook');
  const [progress, setProgress] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Lấy danh sách các chương học của môn này (Sắp xếp theo thứ tự)
        const { data: chaptersData } = await supabase
          .from('chapters')
          .select('*')
          .eq('subject_id', subjectId)
          .order('order_index', { ascending: true });
        
        if (chaptersData) setChapters(chaptersData);

        // 2. Lấy tổng số câu hỏi
        const { data: questions } = await supabase
          .from('questions')
          .select('id')
          .eq('subject_id', subjectId);
        
        const totalQuestions = questions?.length || 0;

        // 3. Lấy lịch sử làm bài
        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('question_id, is_correct, is_flagged')
          .eq('user_id', user.id);

        if (questions && userProgress) {
          const subjectQuestionIds = questions.map(q => q.id);
          const relevantProgress = userProgress.filter(p => subjectQuestionIds.includes(p.question_id));

          const correctCount = relevantProgress.filter(p => p.is_correct === true).length;
          
          if (totalQuestions > 0) {
            setProgress(Math.round((correctCount / totalQuestions) * 100));
          } else {
            setProgress(0);
          }

          const mistakes = relevantProgress.filter(p => p.is_correct === false || p.is_flagged === true).length;
          setMistakesCount(mistakes);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu môn học:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectData();
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark">
        <Loader2 className="w-10 h-10 animate-spin text-acca" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-acca flex items-center gap-3">
              {subjectId} - {subjectName}
            </h1>
            <p className="text-text-secondary dark:text-text-darkSecondary mt-2">
              Keep up the good work!
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface dark:bg-background-dark px-4 py-2 rounded-full border border-border dark:border-border-dark text-text-primary dark:text-text-darkPrimary">
            <Clock className="w-4 h-4 text-acca" />
            <span className="text-sm font-medium">45 days until exam</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Tabs & Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex bg-background dark:bg-surface-dark rounded-md border border-border dark:border-border-dark p-1 shadow-sm">
              <button 
                onClick={() => setActiveTab('notebook')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-colors ${activeTab === 'notebook' ? 'bg-acca-light text-acca dark:bg-[#7F1D1D] dark:text-[#FCA5A5]' : 'text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary'}`}
              >
                <BookOpen className="w-4 h-4" /> Notebook
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-colors ${activeTab === 'resources' ? 'bg-acca-light text-acca dark:bg-[#7F1D1D] dark:text-[#FCA5A5]' : 'text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary'}`}
              >
                <FileText className="w-4 h-4" /> Resources
              </button>
              <button 
                onClick={() => setActiveTab('practice')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-colors ${activeTab === 'practice' ? 'bg-acca-light text-acca dark:bg-[#7F1D1D] dark:text-[#FCA5A5]' : 'text-text-secondary hover:text-text-primary dark:hover:text-text-darkPrimary'}`}
              >
                <Settings className="w-4 h-4" /> Practice
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark min-h-[400px] shadow-sm">
              
              {/* NOTEBOOK TAB */}
              {activeTab === 'notebook' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-text-primary dark:text-text-darkPrimary mb-4">Chapter Notes</h3>
                  {chapters.length === 0 ? (
                    <p className="text-text-secondary text-sm">No chapters found. Please add data in Supabase.</p>
                  ) : (
                    chapters.map((chapter) => (
                      <div 
                        key={chapter.id} 
                        onClick={() => router.push(`/dashboard/${subjectId}/notes/${chapter.id}`)}
                        className="flex items-center justify-between p-4 bg-surface dark:bg-background-dark rounded border border-border dark:border-border-dark hover:border-acca transition-colors cursor-pointer group"
                      >
                        <div>
                          <h4 className="font-medium text-text-primary dark:text-text-darkPrimary group-hover:text-acca transition-colors">{chapter.title}</h4>
                          <p className="text-xs text-text-secondary mt-1">Review theory and summaries</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-acca transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* PRACTICE TAB */}
              {activeTab === 'practice' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-text-primary dark:text-text-darkPrimary mb-4">Chapter Quizzes</h3>
                  {chapters.length === 0 ? (
                    <p className="text-text-secondary text-sm">No chapters found. Please add data in Supabase.</p>
                  ) : (
                    chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center justify-between p-4 bg-surface dark:bg-background-dark rounded border border-border dark:border-border-dark hover:border-acca transition-colors">
                        <div>
                          <h4 className="font-medium text-text-primary dark:text-text-darkPrimary">{chapter.title}</h4>
                          <p className="text-xs text-text-secondary mt-1">Test your knowledge on this chapter</p>
                        </div>
                        <button 
                          onClick={() => router.push(`/dashboard/${subjectId}/quiz/${chapter.id}`)}
                          className="flex items-center gap-2 bg-acca hover:bg-acca-dark text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                        >
                          <PlayCircle className="w-4 h-4" /> Start Quiz
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {/* RESOURCES TAB */}
              {activeTab === 'resources' && (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <FileText className="w-12 h-12 text-text-secondary mb-4 opacity-50" />
                  <h3 className="font-bold text-text-primary dark:text-text-darkPrimary mb-2">Additional Resources</h3>
                  <p className="text-sm text-text-secondary">Past papers, mock exams, and PDFs will be available here.</p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            
            {/* Formula Book Widget */}
            <div className="bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-acca" />
                <h3 className="font-bold text-text-primary dark:text-text-darkPrimary">Formula Book</h3>
              </div>
              <button className="w-full py-2 border border-border dark:border-border-dark rounded text-text-primary dark:text-text-darkPrimary hover:border-acca transition-colors text-sm font-medium">
                View All Formulas
              </button>
            </div>

            {/* Progress Widget */}
            <div className="bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 rounded-full border-2 border-acca border-t-transparent animate-spin"></div>
                <h3 className="font-bold text-text-primary dark:text-text-darkPrimary">Progress</h3>
              </div>
              
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-surface dark:text-background-dark" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    className="text-acca transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-acca">{progress}%</span>
                </div>
              </div>
            </div>

            {/* Review Mistakes Widget */}
            <div className="bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-acca" />
                <h3 className="font-bold text-text-primary dark:text-text-darkPrimary">Review Mistakes</h3>
              </div>
              
              <div className="bg-surface dark:bg-background-dark p-4 rounded mb-4 flex items-end gap-2 border border-border dark:border-border-dark">
                <span className="text-3xl font-black text-acca leading-none">{mistakesCount}</span>
                <span className="text-sm text-text-secondary dark:text-text-darkSecondary mb-1">questions to review</span>
              </div>

              <button 
                onClick={() => router.push(`/dashboard/${subjectId}/quiz/mistakes`)}
                disabled={mistakesCount === 0}
                className={`w-full py-2.5 rounded font-medium transition-colors ${mistakesCount > 0 ? 'bg-acca hover:bg-acca-dark text-white' : 'bg-surface dark:bg-background-dark text-text-secondary cursor-not-allowed'}`}
              >
                Practice Mistakes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}