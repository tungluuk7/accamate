"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flag, Pin, Loader2, ArrowRight, CheckCircle2, CheckSquare, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
// Thêm bộ công cụ Markdown & Toán học
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const topicId = params.topicId as string;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // States quản lý đáp án 
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedSingle, setSelectedSingle] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [shortAnswerValue, setShortAnswerValue] = useState("");

  // States quản lý Công cụ
  const [isFlagged, setIsFlagged] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Thêm dòng này để lấy tham số từ URL
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const mode = searchParams?.get('mode');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Lấy TẤT CẢ câu hỏi của chương này
        let { data: allQuestions, error } = await supabase
          .from('questions')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('chapter_id', topicId)
          .order('order_index', { ascending: true });

        if (error) throw error;
        if (!allQuestions) return;

        // 2. Nếu ở chế độ "Continue", thực hiện lọc bỏ những câu đã làm ĐÚNG
        if (mode === 'continue') {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('question_id, is_correct')
            .eq('user_id', user.id);

          const correctIds = progress
            ?.filter(p => p.is_correct === true)
            .map(p => p.question_id) || [];

          // Chỉ giữ lại những câu CHƯA LÀM hoặc làm SAI
          allQuestions = allQuestions.filter(q => !correctIds.includes(q.id));
        }

        setQuestions(allQuestions);
      } catch (error) {
        console.error("Lỗi tải dữ liệu quiz:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [subjectId, topicId, mode]);

  // --- LOGIC MỚI: Tải ghi chú và trạng thái khi đổi câu hỏi ---
  useEffect(() => {
    const fetchCurrentProgress = async () => {
      if (questions.length === 0) return;
      const currentId = questions[currentIndex].id;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_progress')
        .select('is_flagged, personal_note')
        .eq('user_id', user.id)
        .eq('question_id', currentId)
        .maybeSingle();

      if (data) {
        setIsFlagged(data.is_flagged || false);
        setNoteText(data.personal_note || "");
        // Nếu đã có ghi chú, tự động mở ô nhập liệu cho Trang dễ thấy
        if (data.personal_note) setIsNoteOpen(true);
      } else {
        setIsFlagged(false);
        setNoteText("");
        setIsNoteOpen(false);
      }
    };

    fetchCurrentProgress();
  }, [currentIndex, questions]);

  const saveProgress = async (correctStatus: boolean | null, flagStatus: boolean, note: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_progress').upsert({
        user_id: user.id,
        question_id: questions[currentIndex].id,
        is_correct: correctStatus,
        is_flagged: flagStatus,
        personal_note: note,
        last_attempted: new Date().toISOString(),
      }, { onConflict: 'user_id,question_id' });
    } catch (error) {
      console.error("Lỗi lưu progress:", error);
    }
  };

  const handleToggleFlag = () => {
    const newFlag = !isFlagged;
    setIsFlagged(newFlag);
    saveProgress(isAnswered ? isCorrect : null, newFlag, noteText);
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    await saveProgress(isAnswered ? isCorrect : null, isFlagged, noteText);
    setTimeout(() => setIsSavingNote(false), 800); // Tạo hiệu ứng chờ cho xịn
  };

  const handleManualCheck = () => {
    let correct = false;
    const q = questions[currentIndex];
    if (q.question_type === 'MULTIPLE') {
      const correctArray = q.correct_option.split(',').map((s: string) => s.trim()).sort();
      correct = JSON.stringify(correctArray) === JSON.stringify(selectedMultiple.sort());
    } else if (q.question_type === 'SHORT_ANSWER') {
      const validAnswers = q.correct_option.split(';').map((ans: string) => ans.trim().toLowerCase());
      correct = validAnswers.includes(shortAnswerValue.trim().toLowerCase());
    }
    setIsCorrect(correct);
    setIsAnswered(true);
    saveProgress(correct, isFlagged, noteText);
  };

  const handleSelectOption = (key: string) => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    if (q.question_type === 'SINGLE' || q.question_type === 'TRUE_FALSE') {
      setSelectedSingle(key);
      const correct = key === q.correct_option;
      setIsCorrect(correct);
      setIsAnswered(true);
      saveProgress(correct, isFlagged, noteText);
    } else if (q.question_type === 'MULTIPLE') {
      setSelectedMultiple(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedSingle(null);
      setSelectedMultiple([]);
      setShortAnswerValue("");
    } else {
      router.push(`/dashboard/${subjectId}`);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark"><Loader2 className="w-10 h-10 animate-spin text-acca" /></div>;
  if (questions.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-background-dark"><h2 className="text-xl font-bold mb-4">No questions found!</h2><button onClick={() => router.back()} className="text-acca hover:underline">Go back</button></div>;

  const currentQuestionData = questions[currentIndex];
  const qType = currentQuestionData.question_type || 'SINGLE';

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-background-dark transition-colors duration-300">
      {/* Header */}
      <div className="bg-background dark:bg-surface-dark border-b border-border dark:border-border-dark px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push(`/dashboard/${subjectId}`)} className="flex items-center gap-2 text-text-secondary hover:text-acca transition-colors font-medium"><ArrowLeft className="w-5 h-5" /><span>Exit Quiz</span></button>
        <div className="font-bold text-text-primary dark:text-text-darkPrimary">Question {currentIndex + 1} of {questions.length}</div>
      </div>

      <div className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          <div className="bg-background dark:bg-surface-dark p-8 rounded-md border border-border dark:border-border-dark shadow-sm">
            <div className="text-xs font-bold text-acca mb-3 uppercase tracking-wider">{qType.replace('_', ' ')}</div>
            <div className="prose dark:prose-invert max-w-none text-xl leading-relaxed font-medium text-text-primary dark:text-text-darkPrimary">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {currentQuestionData.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Answer Area - Giữ nguyên logic render của bạn */}
          {/* ... (Phần renderAnswerArea đã được tối ưu tích hợp bên trên) ... */}
          {qType === 'SHORT_ANSWER' ? (
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Type your answer here..." value={shortAnswerValue} onChange={(e) => setShortAnswerValue(e.target.value)} disabled={isAnswered} className={`w-full p-6 border-2 rounded-md bg-background dark:bg-surface-dark text-text-primary dark:text-text-darkPrimary text-xl focus:outline-none transition-colors ${isAnswered ? (isCorrect ? 'border-[#16A34A] bg-[#F0FDF4] dark:bg-[#14532D]' : 'border-acca bg-acca-light dark:bg-[#7F1D1D]') : 'border-border dark:border-border-dark focus:border-acca'}`} />
              {!isAnswered && <button onClick={handleManualCheck} disabled={shortAnswerValue.trim() === ""} className="w-full py-4 bg-acca hover:bg-acca-dark text-white font-bold rounded-md disabled:opacity-50">Check Answer</button>}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[['A', currentQuestionData.option_a || 'True'], ['B', currentQuestionData.option_b || 'False'], ['C', currentQuestionData.option_c], ['D', currentQuestionData.option_d]].filter(opt => opt[1] && opt[1] !== "").map(([key, value]) => {
                let style = "bg-background dark:bg-surface-dark border-border dark:border-border-dark text-text-primary dark:text-text-darkPrimary hover:border-acca";
                const isSelected = qType === 'MULTIPLE' ? selectedMultiple.includes(key) : selectedSingle === key;
                if (isAnswered) {
                  const correctKeys = currentQuestionData.correct_option.split(',').map((s: string) => s.trim());
                  if (correctKeys.includes(key)) style = "bg-[#F0FDF4] border-[#16A34A] text-[#166534] dark:bg-[#14532D] dark:text-[#4ADE80]";
                  else if (isSelected) style = "bg-acca-light border-acca text-acca dark:bg-[#7F1D1D] dark:text-[#FCA5A5]";
                  else style = "bg-surface dark:bg-background-dark border-border opacity-50";
                } else if (isSelected) style = "border-acca ring-1 ring-acca";
                return (
                  <button key={key} onClick={() => handleSelectOption(key)} disabled={isAnswered} className={`w-full flex items-center p-4 rounded-md border-2 transition-all text-left ${style}`}>
                    <span className={`w-8 h-8 flex items-center justify-center rounded mr-4 shrink-0 font-bold ${qType === 'MULTIPLE' ? 'rounded-md border-2' : 'rounded-full border border-current'}`}>{qType === 'MULTIPLE' && isSelected ? <CheckSquare className="w-5 h-5 text-acca" /> : key}</span>
                    <span className="text-lg flex-1">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                        components={{ p: ({node, ...props}) => <span {...props} /> }} 
                      >
                        {value}
                      </ReactMarkdown>
                    </span>
                  </button>
                );
              })}
              {qType === 'MULTIPLE' && !isAnswered && <button onClick={handleManualCheck} disabled={selectedMultiple.length === 0} className="w-full py-4 mt-2 bg-acca hover:bg-acca-dark text-white font-bold rounded-md disabled:opacity-50">Check Answers</button>}
            </div>
          )}

          {/* Tools Box: Flag & Personal Note */}
          <div className="flex flex-col gap-4 mt-2 border-t border-border dark:border-border-dark pt-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button onClick={handleToggleFlag} className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-medium ${isFlagged ? 'text-acca bg-acca-light dark:bg-[#7F1D1D] dark:text-[#FCA5A5]' : 'text-text-secondary hover:bg-surface dark:hover:bg-background-dark'}`}><Flag className={`w-5 h-5 ${isFlagged ? 'fill-current' : ''}`} /><span>{isFlagged ? 'Flagged' : 'Flag Question'}</span></button>
                <button onClick={() => setIsNoteOpen(!isNoteOpen)} className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-medium ${isNoteOpen || noteText.length > 0 ? 'text-[#EAB308] bg-[#FEF9C3] dark:bg-[#713F12] dark:text-[#FDE047]' : 'text-text-secondary hover:bg-surface dark:hover:bg-background-dark'}`}><Pin className={`w-5 h-5 ${isNoteOpen || noteText.length > 0 ? 'fill-current' : ''}`} /><span>Personal Note</span></button>
              </div>
              
              {isNoteOpen && (
                <button 
                  onClick={handleSaveNote} 
                  disabled={isSavingNote}
                  className="flex items-center gap-2 text-sm font-bold text-acca hover:bg-acca-light px-3 py-1.5 rounded transition-all disabled:opacity-50"
                >
                  {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
              )}
            </div>

            {isNoteOpen && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write your own mnemonics or tips for this question..." className="w-full min-h-[120px] p-4 bg-background dark:bg-surface-dark border border-border dark:border-border-dark rounded-md shadow-sm focus:outline-none focus:border-acca focus:ring-1 focus:ring-acca text-text-primary dark:text-text-darkPrimary resize-y" />
              </div>
            )}
          </div>

          {/* Explanation & Next Button */}
          {isAnswered && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 mt-4 pb-12">
              <div className={`p-6 rounded-md border-l-4 ${isCorrect ? 'bg-[#F0FDF4] border-[#16A34A] dark:bg-[#14532D]' : 'bg-acca-light border-acca dark:bg-[#7F1D1D]'}`}><h3 className={`font-bold mb-2 ${isCorrect ? 'text-[#166534] dark:text-[#4ADE80]' : 'text-acca dark:text-[#FCA5A5]'}`}>{isCorrect ? 'Correct!' : 'Incorrect'}</h3><div className="prose dark:prose-invert max-w-none leading-relaxed text-text-primary dark:text-text-darkPrimary">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {currentQuestionData.explanation}
                  </ReactMarkdown>
                </div></div>
              <button onClick={handleNextQuestion} className="w-full flex items-center justify-center gap-2 bg-acca text-white py-4 rounded-md font-bold text-lg shadow-sm">{currentIndex === questions.length - 1 ? <><CheckCircle2 className="w-6 h-6" /> Complete Quiz</> : <>Next Question <ArrowRight className="w-6 h-6" /></>}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}