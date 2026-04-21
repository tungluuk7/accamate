"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flag, Pin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  // States lưu trữ dữ liệu từ Database
  const [questionData, setQuestionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States quản lý tương tác
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Gọi dữ liệu từ Supabase khi vừa vào trang
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('subject_id', subjectId)
          .limit(1)
          .single(); // Lấy 1 câu hỏi đầu tiên của môn học này

        if (error) throw error;
        if (data) setQuestionData(data);
      } catch (error) {
        console.error("Lỗi khi tải câu hỏi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [subjectId]);

  // Nếu đang tải dữ liệu, hiển thị vòng xoay
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark">
        <Loader2 className="w-10 h-10 animate-spin text-acca" />
      </div>
    );
  }

  // Nếu không tìm thấy câu hỏi nào
  if (!questionData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-background-dark">
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-darkPrimary mb-4">No questions found!</h2>
        <button onClick={() => router.back()} className="text-acca hover:underline">Go back</button>
      </div>
    );
  }

  const handleSelectOption = (optionKey: string) => {
    if (selectedOption) return; 
    setSelectedOption(optionKey);
  };

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === questionData.correct_option;

  // Đóng gói 4 đáp án từ Database thành Object để dễ map ra giao diện
  const options = {
    A: questionData.option_a,
    B: questionData.option_b,
    C: questionData.option_c,
    D: questionData.option_d,
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-background-dark transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <div className="bg-background dark:bg-surface-dark border-b border-border dark:border-border-dark px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.push(`/dashboard/${subjectId}`)}
          className="flex items-center gap-2 text-text-secondary hover:text-acca transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to {subjectId}</span>
        </button>
        <div className="font-bold text-text-primary dark:text-text-darkPrimary">
          Question Practice
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          
          {/* Question Box */}
          <div className="bg-background dark:bg-surface-dark p-8 rounded-md border border-border dark:border-border-dark shadow-sm">
            <h2 className="text-xl leading-relaxed text-text-primary dark:text-text-darkPrimary font-medium">
              {questionData.content}
            </h2>
          </div>

          {/* Options List */}
          <div className="flex flex-col gap-3">
            {Object.entries(options).map(([key, value]) => {
              let buttonStyle = "bg-background dark:bg-surface-dark border-border dark:border-border-dark text-text-primary dark:text-text-darkPrimary hover:border-acca";
              
              if (isAnswered) {
                if (key === questionData.correct_option) {
                  buttonStyle = "bg-[#F0FDF4] border-[#16A34A] text-[#166534] dark:bg-[#14532D] dark:text-[#4ADE80] dark:border-[#22C55E]";
                } else if (key === selectedOption) {
                  buttonStyle = "bg-acca-light border-acca text-acca dark:bg-[#7F1D1D] dark:text-[#FCA5A5] dark:border-[#DC2626]";
                } else {
                  buttonStyle = "bg-surface dark:bg-background-dark border-border dark:border-border-dark text-text-secondary opacity-50 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  disabled={isAnswered}
                  className={`w-full flex items-center p-4 rounded-md border-2 transition-all duration-200 text-left ${buttonStyle}`}
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded border border-current font-bold mr-4 shrink-0">
                    {key}
                  </span>
                  <span className="text-lg">{value as string}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className={`p-6 rounded-md border-l-4 animate-in fade-in slide-in-from-bottom-2 ${
              isCorrect 
                ? 'bg-[#F0FDF4] border-[#16A34A] dark:bg-[#14532D]' 
                : 'bg-acca-light border-acca dark:bg-[#7F1D1D]'
            }`}>
              <h3 className={`font-bold mb-2 ${isCorrect ? 'text-[#166534] dark:text-[#4ADE80]' : 'text-acca dark:text-[#FCA5A5]'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
              <p className="text-text-primary dark:text-text-darkPrimary leading-relaxed">
                {questionData.explanation}
              </p>
            </div>
          )}

          {/* Tools Box: Flag & Pin Note */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsFlagged(!isFlagged)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-medium ${
                  isFlagged 
                    ? 'text-acca bg-acca-light' 
                    : 'text-text-secondary hover:bg-surface dark:hover:bg-background-dark'
                }`}
              >
                <Flag className={`w-5 h-5 ${isFlagged ? 'fill-current' : ''}`} />
                <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>

              <button 
                onClick={() => setIsNoteOpen(!isNoteOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-medium ${
                  isNoteOpen || noteText.length > 0
                    ? 'text-[#EAB308] bg-[#FEF9C3] dark:bg-[#713F12] dark:text-[#FDE047]' 
                    : 'text-text-secondary hover:bg-surface dark:hover:bg-background-dark'
                }`}
              >
                <Pin className={`w-5 h-5 ${isNoteOpen || noteText.length > 0 ? 'fill-current' : ''}`} />
                <span>Personal Note</span>
              </button>
            </div>

            {isNoteOpen && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type your personal note or mnemonic here..."
                  className="w-full min-h-[120px] p-4 bg-background dark:bg-surface-dark border border-border dark:border-border-dark rounded-md shadow-sm focus:outline-none focus:border-acca focus:ring-1 focus:ring-acca text-text-primary dark:text-text-darkPrimary resize-y"
                ></textarea>
                <p className="text-xs text-text-secondary mt-2">
                  Notes are automatically saved to your profile.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}