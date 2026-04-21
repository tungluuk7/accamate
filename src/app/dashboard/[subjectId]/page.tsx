"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ACCA_SUBJECTS } from '@/lib/constants';
import { 
  BookOpen, 
  FileText, 
  PenTool, 
  Calculator, 
  AlertCircle, 
  PieChart,
  Clock
} from 'lucide-react';

export default function SubjectDetailPage() {
  // Lấy mã môn học từ URL
  const params = useParams();
  const subjectId = params.subjectId as string;
  
  // Quản lý trạng thái Tab đang active
  const [activeTab, setActiveTab] = useState('notebook');

  // Tìm thông tin môn học tương ứng
  const subject = ACCA_SUBJECTS.find(s => s.id === subjectId) || { name: 'Unknown Subject', code: '' };

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* =========================================
            LEFT COLUMN: MAIN STUDY AREA (70%) 
            ========================================= */}
        <div className="w-full lg:w-[70%] flex flex-col gap-6">
          
          {/* 1. Header Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-background dark:bg-surface-dark p-6 rounded-md shadow-sm border border-border dark:border-border-dark">
            <div>
              <h1 className="text-3xl font-bold text-acca mb-1">
                {subjectId} - {subject.name}
              </h1>
              <p className="text-text-secondary dark:text-text-darkSecondary font-medium">
                Keep up the good work!
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-text-primary dark:text-text-darkPrimary bg-surface dark:bg-background-dark px-4 py-2 rounded-md border border-border dark:border-border-dark">
              <Clock className="w-5 h-5 text-acca" />
              <span className="font-semibold">45 days until exam</span>
            </div>
          </div>

          {/* 2. Tabs Navigation */}
          <div className="flex gap-2 bg-background dark:bg-surface-dark p-2 rounded-md shadow-sm border border-border dark:border-border-dark overflow-x-auto">
            {[
              { id: 'notebook', label: 'Notebook', icon: BookOpen },
              { id: 'resources', label: 'Resources', icon: FileText },
              { id: 'practice', label: 'Practice', icon: PenTool },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded transition-colors font-medium ${
                    isActive 
                      ? 'bg-acca-light text-acca' 
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary dark:hover:bg-background-dark dark:hover:text-text-darkPrimary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 3. Dynamic Tab Content */}
          <div className="bg-background dark:bg-surface-dark p-6 rounded-md shadow-sm border border-border dark:border-border-dark min-h-[500px]">
            {activeTab === 'notebook' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-text-darkPrimary">Chapter Notes</h2>
                <p className="text-text-secondary">Your markdown notes will appear here in a tree view.</p>
              </div>
            )}
            
            {activeTab === 'resources' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-text-darkPrimary">Study Resources</h2>
                <p className="text-text-secondary">PDF links and external reading materials will be listed here.</p>
              </div>
            )}
            
            {activeTab === 'practice' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold mb-4 text-text-primary dark:text-text-darkPrimary">Mock Quizzes</h2>
                <p className="text-text-secondary mb-6">Select a topic to start practicing.</p>
                
                {/* Nút mồi để chuẩn bị cho phần Quiz */}
                <Link href={`/dashboard/${subjectId}/quiz/chapter-1`}>
                  <button className="bg-acca hover:bg-acca-dark text-white py-2.5 px-6 rounded font-medium transition-colors">
                    Start Chapter 1 Quiz
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: TOOLS SIDEBAR (30%) 
            ========================================= */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6">
          
          {/* Formula Book Card */}
          <div className="bg-background dark:bg-surface-dark p-6 rounded-md shadow-sm border border-border dark:border-border-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-acca-light rounded text-acca">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-text-darkPrimary">Formula Book</h3>
            </div>
            <p className="text-sm text-text-secondary dark:text-text-darkSecondary mb-6">
              Quick access to essential formulas.
            </p>
            <button className="w-full py-2.5 border-2 border-border dark:border-border-dark rounded text-text-primary dark:text-text-darkPrimary hover:border-acca hover:text-acca transition-colors font-medium">
              View All Formulas
            </button>
          </div>

          {/* Learning Progress Card */}
          <div className="bg-background dark:bg-surface-dark p-6 rounded-md shadow-sm border border-border dark:border-border-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-acca-light rounded text-acca">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-text-darkPrimary">Progress</h3>
            </div>
            {/* Vòng tròn Progress giả định */}
            <div className="flex items-center justify-center h-32 border-8 border-surface dark:border-background-dark border-t-acca rounded-full aspect-square mx-auto mb-2">
               <span className="text-3xl font-black text-acca">45%</span>
            </div>
          </div>

          {/* Review Mistakes Card */}
          <div className="bg-background dark:bg-surface-dark p-6 rounded-md shadow-sm border border-border dark:border-border-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-acca-light rounded text-acca">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary dark:text-text-darkPrimary">Review Mistakes</h3>
            </div>
            <div className="bg-surface dark:bg-background-dark p-4 rounded mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-black text-acca">12</span>
              <span className="text-text-secondary dark:text-text-darkSecondary font-medium">flagged questions</span>
            </div>
            <button className="w-full py-2.5 bg-acca hover:bg-acca-dark text-white rounded transition-colors font-medium">
              Practice Mistakes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}