"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flag, Pin, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  // States lưu trữ MẢNG câu hỏi và vị trí hiện tại
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // States quản lý tương tác cho câu hỏi HIỆN TẠI
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Gọi TẤT CẢ câu hỏi của môn học này
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('subject_id', subjectId)
          .order('id'); // Tải tất cả, không dùng .limit(1) nữa

        if (error) throw error;
        if (data) setQuestions(data);
      } catch (error) {
        console.error("Lỗi khi tải câu hỏi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark">
        <Loader2 className="w-10 h-10 animate-spin text-acca" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-background-dark">
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-darkPrimary mb-4">No questions found!</h2>
        <button onClick={() => router.back()} className="text-acca hover:underline">Go back</button>
      </div>
    );
  }

  // Lấy dữ liệu của câu hỏi đang hiển thị
  const currentQuestionData = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const saveProgress = async (selectedKey: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isCorrect = selectedKey === currentQuestionData.correct_option;

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          question_id: currentQuestionData.id,
          is_correct: isCorrect,
          last_attempted: new Date().toISOString(),
        }, {
          onConflict: 'user_id,question_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error("Lỗi khi lưu progress:", error);
    }
  };

  const handleSelectOption = (optionKey: string) => {
    if (selectedOption) return; 
    setSelectedOption(optionKey);
    saveProgress(optionKey);
  };

  // Hàm xử lý khi bấm nút "Next"
  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      // Chuyển sang câu tiếp theo và reset lại trạng thái giao diện
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsFlagged(false);
      setIsNoteOpen(false);
      setNoteText("");
    } else {
      // Nếu là câu cuối, quay về trang chi tiết môn học
      router.push(`/dashboard/${subjectId}`);
    }
  };

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQuestionData.correct_option;

  const options = {
    A: currentQuestionData.option_a,
    B: currentQuestionData.option_b,
    C: currentQuestionData.option_c,
    D: currentQuestionData.option_d,
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
          <span>Exit Quiz</span>
        </button>
        <div className="font-bold text-text-primary dark:text-text-darkPrimary">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          
          <div className="bg-background dark:bg-surface-dark p-8 rounded-md border border-border dark:border-border-dark shadow-sm">
            <h2 className="text-xl leading-relaxed text-text-primary dark:text-text-darkPrimary font-medium">
              {currentQuestionData.content}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {Object.entries(options).map(([key, value]) => {
              let buttonStyle = "bg-background dark:bg-surface-dark border-border dark:border-border-dark text-text-primary dark:text-text-darkPrimary hover:border-acca";
              
              if (isAnswered) {
                if (key === currentQuestionData.correct_option) {
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

          {/* Explanation & Next Button Box */}
          {isAnswered && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className={`p-6 rounded-md border-l-4 ${
                isCorrect 
                  ? 'bg-[#F0FDF4] border-[#16A34A] dark:bg-[#14532D]' 
                  : 'bg-acca-light border-acca dark:bg-[#7F1D1D]'
              }`}>
                <h3 className={`font-bold mb-2 ${isCorrect ? 'text-[#166534] dark:text-[#4ADE80]' : 'text-acca dark:text-[#FCA5A5]'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h3>
                <p className="text-text-primary dark:text-text-darkPrimary leading-relaxed">
                  {currentQuestionData.explanation}
                </p>
              </div>

              {/* NEXT BUTTON */}
              <button 
                onClick={handleNextQuestion}
                className="w-full flex items-center justify-center gap-2 bg-acca hover:bg-acca-dark text-white py-4 rounded-md font-bold text-lg transition-colors shadow-sm"
              >
                {isLastQuestion ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Complete Quiz
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tools Box: Flag & Pin Note */}
          <div className="flex flex-col gap-4 mt-2">
            {/* ... (Phần Flag và Note giữ nguyên như cũ) ... */}
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
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}