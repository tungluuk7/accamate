import Link from 'next/link';
import { ACCA_SUBJECTS } from '@/lib/constants';
import { PlayCircle, BookOpen } from 'lucide-react';

export default function DashboardPage() {
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
            const isStarted = subject.progress > 0;

            return (
              <div 
                key={subject.id}
                className="bg-background dark:bg-surface-dark rounded-md border border-border dark:border-border-dark shadow-sm p-6 flex flex-col hover:border-acca transition-colors duration-200"
              >
                {/* Mã môn & Tên môn */}
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

                {/* Progress Bar & Nút hành động */}
                <div className="mt-6">
                  {/* Thanh tiến trình */}
                  <div className="w-full bg-surface dark:bg-background-dark rounded-full h-2 mb-4 border border-border dark:border-border-dark overflow-hidden">
                    <div 
                      className="bg-acca h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>

                  {/* Nút bấm động */}
                  <Link 
                    href={`/dashboard/${subject.id}`}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded font-medium transition-colors ${
                      isStarted 
                        ? 'bg-acca hover:bg-acca-dark text-white' 
                        : 'bg-transparent border-2 border-acca text-acca hover:bg-acca-light'
                    }`}
                  >
                    {isStarted ? (
                      <>
                        <PlayCircle className="w-5 h-5" />
                        <span>Continue</span>
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