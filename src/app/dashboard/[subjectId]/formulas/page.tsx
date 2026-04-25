"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, Loader2, Search, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function FormulaBookPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [formulas, setFormulas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const { data, error } = await supabase
          .from('formulas')
          .select('*')
          .eq('subject_id', subjectId)
          .order('title');

        if (error) throw error;
        setFormulas(data || []);
      } catch (error) {
        console.error("Lỗi tải công thức:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFormulas();
  }, [subjectId]);

  // Lọc công thức theo ô tìm kiếm
  const filteredFormulas = formulas.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.formula_content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-background-dark"><Loader2 className="w-10 h-10 animate-spin text-acca" /></div>;

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-background dark:hover:bg-surface-dark rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-text-secondary" />
            </button>
            <h1 className="text-3xl font-black text-text-primary dark:text-text-darkPrimary flex items-center gap-3">
              <Calculator className="text-acca" /> Formula Book
            </h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background dark:bg-surface-dark border border-border dark:border-border-dark rounded-md focus:outline-none focus:border-acca w-full md:w-64"
            />
          </div>
        </div>

        {/* Formula Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFormulas.length === 0 ? (
            <div className="col-span-full py-20 text-center text-text-secondary">No formulas found.</div>
          ) : (
            filteredFormulas.map((f) => (
              <div key={f.id} className="bg-background dark:bg-surface-dark p-6 rounded-md border border-border dark:border-border-dark shadow-sm hover:border-acca transition-all group">
                <h3 className="text-lg font-bold text-acca mb-3">{f.title}</h3>
                <div className="bg-surface dark:bg-background-dark p-4 rounded-md font-mono text-xl text-center border border-dashed border-border mb-4 overflow-x-auto">
                  {f.formula_content}
                </div>
                {f.explanation && (
                  <div className="flex gap-2 text-sm text-text-secondary">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="italic">{f.explanation}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}