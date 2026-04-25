"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flag, Pin, Loader2, ArrowRight, CheckCircle2, CheckSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const topicId = params.topicId as string;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // States quản lý đáp án cho ĐA DẠNG câu hỏi
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [shortAnswerValue, setShortAnswerValue] = useState("");

  const [isFlagged, setIsFlagged] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // 1. TRƯỜNG HỢP: ÔN TẬP CÂU SAI
        if (topicId === 'mistakes') {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Lấy ID các câu mà Trang đã làm sai (is_correct = false) hoặc đã cắm cờ (is_flagged = true)
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('question_id')
            .eq('user_id', user.id)
            .or('is_correct.eq.false,is_flagged.eq.true');

          const mistakeIds = progressData?.map(p => p.question_id) || [];

          if (mistakeIds.length === 0) {
            setQuestions([]);
            return;
          }

          // Kéo nội dung các câu hỏi đó về
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('subject_id', subjectId)
            .in('id', mistakeIds) // Lọc những câu nằm trong danh sách làm sai
            .order('id'); 

          if (error) throw error;
          if (data) setQuestions(data);

        } else {
          // 2. TRƯỜNG HỢP BÌNH THƯỜNG: LÀM QUIZ THEO CHƯƠNG
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('subject_id', subjectId)
            .eq('chapter_id', topicId)
            .order('id'); 

          if (error) throw error;
          if (data) setQuestions(data);
        }
      } catch (error) {
        console.error("Lỗi tải câu hỏi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [subjectId, topicId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-acca" /></div>;
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center"><h2 className="text-xl">No questions found!</h2></div>;

  const currentQuestionData = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const qType = currentQuestionData.question_type || 'SINGLE';

  const saveProgress = async (correctStatus: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_progress').upsert({
        user_id: user.id,
        question_id: currentQuestionData.id,
        is_correct: correctStatus,
        last_attempted: new Date().toISOString(),
      }, { onConflict: 'user_id,question_id' });
    } catch (error) {
      console.error("Lỗi lưu progress:", error);
    }
  };

  // NÚT CHẤM ĐIỂM THỦ CÔNG (Dành cho Multiple và Short Answer)
  const handleManualCheck = () => {
    let correct = false;
    if (qType === 'MULTIPLE') {
      const correctArray = currentQuestionData.correct_option.split(',').sort();
      const selectedArray = selectedMultiple.sort();
      correct = JSON.stringify(correctArray) === JSON.stringify(selectedArray);
    } else if (qType === 'SHORT_ANSWER') {
      correct = shortAnswerValue.trim().toLowerCase() === currentQuestionData.correct_option.trim().toLowerCase();
    }
    
    setIsCorrect(correct);
    setIsAnswered(true);
    saveProgress(correct);
  };

  // NÚT CHỌN ĐÁP ÁN (Dành cho Single, True/False, Multiple)
  const handleSelectOption = (key: string) => {
    if (isAnswered) return;

    if (qType === 'SINGLE' || qType === 'TRUE_FALSE') {
      setSelectedSingle(key);
      const correct = key === currentQuestionData.correct_option;
      setIsCorrect(correct);
      setIsAnswered(true);
      saveProgress(correct);
    } else if (qType === 'MULTIPLE') {
      setSelectedMultiple(prev => 
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
      // Reset toàn bộ state
      setIsAnswered(false);
      setSelectedSingle(null);
      setSelectedMultiple([]);
      setShortAnswerValue("");
      setIsFlagged(false);
      setIsNoteOpen(false);
    } else {
      router.push(`/dashboard/${subjectId}`);
    }
  };

  // HÀM RENDER KHU VỰC TRẢ LỜI TÙY THEO LOẠI CÂU HỎI
  const renderAnswerArea = () => {
    if (qType === 'SHORT_ANSWER') {
      return (
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Type your numeric answer here..."
            value={shortAnswerValue}
            onChange={(e) => setShortAnswerValue(e.target.value)}
            disabled={isAnswered}
            className={`w-full p-6 border-2 rounded-md bg-background dark:bg-surface-dark text-text-primary dark:text-text-darkPrimary text-xl focus:outline-none transition-colors ${isAnswered ? (isCorrect ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-acca bg-acca-light') : 'border-border focus:border-acca'}`}
          />
          {!isAnswered && (
            <button onClick={handleManualCheck} disabled={shortAnswerValue.trim() === ""} className="w-full py-4 bg-acca hover:bg-acca-dark text-white font-bold rounded-md disabled:opacity-50">
              Check Answer
            </button>
          )}
        </div>
      );
    }

    const optionsToRender = qType === 'TRUE_FALSE' 
      ? [['A', currentQuestionData.option_a || 'True'], ['B', currentQuestionData.option_b || 'False']]
      : [['A', currentQuestionData.option_a], ['B', currentQuestionData.option_b], ['C', currentQuestionData.option_c], ['D', currentQuestionData.option_d]].filter(opt => opt[1] !== "");

    return (
      <div className="flex flex-col gap-3">
        {optionsToRender.map(([key, value]) => {
          let style = "bg-background dark:bg-surface-dark border-border text-text-primary hover:border-acca";
          const isSelected = qType === 'MULTIPLE' ? selectedMultiple.includes(key) : selectedSingle === key;
          const correctKeys = currentQuestionData.correct_option.split(',');

          if (isAnswered) {
            if (correctKeys.includes(key)) {
              style = "bg-[#F0FDF4] border-[#16A34A] text-[#166534] dark:bg-[#14532D] dark:text-[#4ADE80]";
            } else if (isSelected) {
              style = "bg-acca-light border-acca text-acca dark:bg-[#7F1D1D] dark:text-[#FCA5A5]";
            } else {
              style = "bg-surface border-border opacity-50";
            }
          } else if (isSelected) {
            style = "border-acca ring-1 ring-acca";
          }

          return (
            <button key={key} onClick={() => handleSelectOption(key)} disabled={isAnswered} className={`w-full flex items-center p-4 rounded-md border-2 transition-all text-left ${style}`}>
              <span className={`w-8 h-8 flex items-center justify-center rounded mr-4 shrink-0 font-bold ${qType === 'MULTIPLE' ? 'rounded-md border-2' : 'rounded-full border border-current'}`}>
                {qType === 'MULTIPLE' ? (isSelected ? <CheckSquare className="w-5 h-5 text-acca" /> : key) : key}
              </span>
              <span className="text-lg">{value}</span>
            </button>
          );
        })}

        {qType === 'MULTIPLE' && !isAnswered && (
          <button onClick={handleManualCheck} disabled={selectedMultiple.length === 0} className="w-full py-4 mt-2 bg-acca hover:bg-acca-dark text-white font-bold rounded-md disabled:opacity-50">
            Check Answers
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-background-dark transition-colors duration-300">
      <div className="bg-background dark:bg-surface-dark border-b border-border px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.push(`/dashboard/${subjectId}`)} className="flex items-center gap-2 text-text-secondary hover:text-acca font-medium">
          <ArrowLeft className="w-5 h-5" /> <span>Exit Quiz</span>
        </button>
        <div className="font-bold text-text-primary">Question {currentIndex + 1} of {questions.length}</div>
      </div>

      <div className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          <div className="bg-background dark:bg-surface-dark p-8 rounded-md border border-border shadow-sm">
            <div className="text-xs font-bold text-acca mb-3 uppercase tracking-wider">{qType.replace('_', ' ')}</div>
            <h2 className="text-xl leading-relaxed font-medium">{currentQuestionData.content}</h2>
          </div>

          {renderAnswerArea()}

          {isAnswered && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className={`p-6 rounded-md border-l-4 ${isCorrect ? 'bg-[#F0FDF4] border-[#16A34A]' : 'bg-acca-light border-acca'}`}>
                <h3 className={`font-bold mb-2 ${isCorrect ? 'text-[#166534]' : 'text-acca'}`}>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                <p className="leading-relaxed">{currentQuestionData.explanation}</p>
              </div>
              <button onClick={handleNextQuestion} className="w-full flex items-center justify-center gap-2 bg-acca text-white py-4 rounded-md font-bold text-lg">
                {isLastQuestion ? <><CheckCircle2 className="w-6 h-6" /> Complete Quiz</> : <>Next Question <ArrowRight className="w-6 h-6" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}