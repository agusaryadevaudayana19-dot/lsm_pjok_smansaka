import React, { useState, useEffect } from 'react';
import { Quiz, Soal, User } from '../../types';
import { LMSDatabase, dataStorage } from '../../services/dataStorage';
import {
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';

interface MuridQuizProps {
  currentUser: User;
  db: LMSDatabase;
}

export function MuridQuiz({ currentUser, db }: MuridQuizProps) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const quizQuestions: Soal[] = activeQuiz
    ? (Array.isArray(activeQuiz.soal) && activeQuiz.soal.length > 0
        ? activeQuiz.soal
        : Array.isArray(activeQuiz.soalList)
        ? activeQuiz.soalList
        : [])
    : [];

  // Countdown timer
  useEffect(() => {
    if (!activeQuiz || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, isFinished, quizQuestions]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentSoalIndex(0);
    setAnswers({});
    setTimeLeft((quiz.durasiMenit || 20) * 60);
    setIsFinished(false);
    setFinalScore(null);
  };

  const handleSelectAnswer = (soalId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [soalId]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let totalScore = 0;
    let maxScore = 0;

    quizQuestions.forEach((s) => {
      maxScore += s.bobot || 25;
      if (answers[s.id] === s.kunciJawaban) {
        totalScore += s.bobot || 25;
      }
    });

    const calculated100 = Math.round((totalScore / (maxScore || 100)) * 100);
    setFinalScore(calculated100);
    setIsFinished(true);

    // Save quiz score into student's grades
    dataStorage.updateDatabase((prev) => {
      const updatedNilai = prev.nilai.map((n) => {
        if (n.muridId === currentUser.id) {
          const newAkhir = Math.round((n.tugas + calculated100 + n.praktik + n.sikap) / 4);
          return {
            ...n,
            quiz: calculated100,
            nilaiAkhir: newAkhir,
          };
        }
        return n;
      });
      return { ...prev, nilai: updatedNilai };
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* View 1: Active Quizzes List */}
      {!activeQuiz && (
        <>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Quiz & Asesmen PJOK</h2>
            <p className="text-xs text-slate-500">
              Uji pemahaman teori, analisis gerak, dan soal model AKM / HOTS PJOK
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(db.quiz || []).map((q) => {
              const qCount = (q.soal?.length || q.soalList?.length || 0);
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[10px] font-bold">
                        {qCount} Butir Soal
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> {q.durasiMenit} Menit
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-800">{q.judul}</h3>
                    <p className="text-xs text-slate-500">
                      Materi uji: Teknik gerak dasar, variasi formasi, aturan resmi, dan analisis biomekanika.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Guru: {(q.guruNama || q.dibuatOleh || 'Guru PJOK').split(',')[0]}
                    </span>
                    <button
                      onClick={() => handleStartQuiz(q)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Mulai Kerjakan Quiz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View 2: Ongoing Quiz View */}
      {activeQuiz && !isFinished && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-300">UJIAN ONLINE PJOK</span>
              <h3 className="text-base font-extrabold">{activeQuiz.judul}</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Sisa Waktu:</span>
              <span
                className={`font-mono text-base font-black px-3 py-1 rounded-xl ${
                  timeLeft < 180 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-emerald-400'
                }`}
              >
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Number Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {quizQuestions.map((s, idx) => {
                const isAnswered = Boolean(answers[s.id]);
                const isCurrent = currentSoalIndex === idx;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSoalIndex(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isCurrent
                        ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Current Question */}
            {(() => {
              const currentSoal = quizQuestions[currentSoalIndex];
              if (!currentSoal) {
                return (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    Tidak ada butir soal dalam quiz ini.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                      Soal Nomor {currentSoalIndex + 1} ({currentSoal.bobot || 25} Poin)
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {currentSoal.pertanyaan}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {(currentSoal.pilihan || []).map((opsi, optIdx) => {
                      const isSelected = answers[currentSoal.id] === opsi;
                      const optLabel = String.fromCharCode(65 + optIdx); // A, B, C, D, E

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(currentSoal.id, opsi)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-purple-50/80 border-purple-500 text-purple-950 ring-2 ring-purple-200'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {optLabel}
                          </span>
                          <span className="leading-snug">{opsi}</span>
                        </button>
                      );
                    })}

                    {(!currentSoal.pilihan || currentSoal.pilihan.length === 0) && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Tulis Jawaban Singkat:</label>
                        <input
                          type="text"
                          value={answers[currentSoal.id] || ''}
                          onChange={(e) => handleSelectAnswer(currentSoal.id, e.target.value)}
                          placeholder="Ketik jawaban Anda..."
                          className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentSoalIndex === 0}
                onClick={() => setCurrentSoalIndex((prev) => prev - 1)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
              </button>

              {currentSoalIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentSoalIndex((prev) => prev + 1)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  Soal Berikutnya <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Selesai & Kumpulkan Jawaban
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 3: Result & Pembahasan View */}
      {isFinished && activeQuiz && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6 p-6 animate-in zoom-in-95">
          {/* Result Card */}
          <div className="text-center p-6 bg-gradient-to-tr from-purple-50 via-pink-50 to-emerald-50 rounded-2xl border border-purple-100 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-purple-600 mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Quiz Telah Diselesaikan!</h3>
            <p className="text-xs text-slate-500">Nilai Anda telah otomatis tersimpan ke leger nilai rapor PJOK.</p>

            <div className="pt-2">
              <span className="text-4xl font-black text-purple-700 font-mono">{finalScore}</span>
              <span className="text-sm font-bold text-slate-400"> / 100</span>
            </div>
          </div>

          {/* Pembahasan Soal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pembahasan Kunci Jawaban Soal AKM & HOTS:
            </h4>

            {quizQuestions.map((s, idx) => {
              const myAnswer = answers[s.id];
              const isCorrect = myAnswer === s.kunciJawaban;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                    isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800">
                      #{idx + 1}. {s.pertanyaan}
                    </span>
                    {isCorrect ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded flex items-center gap-1 text-[10px] shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Benar (+{s.bobot || 25})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded flex items-center gap-1 text-[10px] shrink-0">
                        <XCircle className="w-3 h-3" /> Salah (0)
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl space-y-1 text-[11px] border border-slate-100">
                    <div>
                      <span className="text-slate-500">Jawaban Anda: </span>
                      <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {myAnswer || '(Kosong / Tidak dijawab)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Kunci Jawaban Resmi: </span>
                      <span className="font-bold text-slate-800">{s.kunciJawaban}</span>
                    </div>
                    {s.pembahasan && (
                      <div className="pt-1 text-slate-600 border-t border-slate-100 mt-1">
                        <span className="font-semibold text-purple-700">Analisis Gerak: </span>
                        {s.pembahasan}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                setActiveQuiz(null);
                setIsFinished(false);
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Kembali ke Daftar Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
