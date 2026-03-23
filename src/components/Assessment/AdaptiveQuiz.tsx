"use client";

import React, { useState } from "react";
import { BrainCircuit, CheckCircle2, XCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdaptiveQuiz = () => {
    const [score, setScore] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [questionIdx, setQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const mockQuestions = [
        {
            level: 1,
            question: "What is the primary unit of quantum information?",
            options: ["Bit", "Qubit", "Byte", "Atom"],
            correct: 1,
            explanation: "A qubit is the basic unit of quantum information, analogous to a classical bit."
        },
        {
            level: 2,
            question: "Which phenomenon allows qubits to exist in multiple states simultaneously?",
            options: ["Entanglement", "Superposition", "Decoherence", "Interference"],
            correct: 1,
            explanation: "Superposition allows a quantum system to be in multiple states at the same time."
        },
        {
            level: 3,
            question: "What remains a major challenge in building scalable quantum computers?",
            options: ["High cooling costs", "Quantum decoherence", "Lack of programming languages", "All of the above"],
            correct: 1,
            explanation: "Quantum decoherence is the loss of quantum coherence, which is essential for quantum computation."
        }
    ];

    const currentQuestion = mockQuestions[questionIdx];

    const handleOptionSelect = (idx: number) => {
        if (showFeedback) return;
        setSelectedOption(idx);
        const correct = idx === currentQuestion.correct;
        setIsCorrect(correct);
        setShowFeedback(true);

        if (correct) {
            setScore(score + 10);
            // Adaptive logic: Increase level if correct
            if (currentLevel < 3) {
                setCurrentLevel(currentLevel + 1);
            }
        } else {
            // Adaptive logic: Stay or decrease level if wrong
            if (currentLevel > 1) {
                // We'll keep it simple for mock
            }
        }
    };

    const handleNext = () => {
        if (questionIdx < mockQuestions.length - 1) {
            setQuestionIdx(questionIdx + 1);
            setSelectedOption(null);
            setIsCorrect(null);
            setShowFeedback(false);
        } else {
            alert(`Quiz Finished! Final Score: ${score}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                        <BrainCircuit size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Adaptive Assessment</h2>
                        <p className="text-xs text-gray-500 font-medium">Difficulty Level: {currentLevel}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-blue-600">{score}</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Points</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={questionIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100"
                >
                    <p className="text-xs font-bold text-blue-500 mb-4 uppercase tracking-widest">Question {questionIdx + 1}</p>
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-8 leading-tight">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={showFeedback}
                                className={`w-full text-left px-6 py-4 rounded-2xl font-semibold border-2 transition-all ${selectedOption === idx
                                        ? isCorrect
                                            ? "bg-green-50 border-green-500 text-green-700"
                                            : "bg-red-50 border-red-500 text-red-700"
                                        : "bg-white border-gray-100 hover:border-blue-200 text-gray-600"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-8 pt-8 border-t border-gray-50"
                            >
                                <div className={`flex items-center gap-3 mb-3 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                    {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                    <span className="font-bold text-lg">{isCorrect ? "Excellent!" : "Not quite..."}</span>
                                </div>
                                <p className="text-gray-600 font-medium leading-relaxed mb-6 italic">
                                    {currentQuestion.explanation}
                                </p>
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                                >
                                    {questionIdx < mockQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                                    <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => window.location.reload()}
                    className="text-gray-400 hover:text-gray-600 flex items-center gap-2 transition-colors font-bold text-sm"
                >
                    <RefreshCcw size={16} />
                    Reset Quiz
                </button>
            </div>
        </div>
    );
};

export default AdaptiveQuiz;
