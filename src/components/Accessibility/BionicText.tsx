"use client";

import React from "react";

interface BionicTextProps {
    text: string;
    className?: string;
}

const BionicText: React.FC<BionicTextProps> = ({ text, className }) => {
    if (!text) return null;

    const processWord = (word: string) => {
        // Keep punctuation separate if it's at the end
        const match = word.match(/^(\w+)([^a-zA-Z0-9]*)$/);
        if (!match) return <span>{word} </span>;

        const [_, mainPart, punctuation] = match;
        const splitPoint = Math.ceil(mainPart.length / 2);
        const firstHalf = mainPart.slice(0, splitPoint);
        const secondHalf = mainPart.slice(splitPoint);

        return (
            <span key={word} className="inline-block whitespace-pre">
                <strong className="font-extrabold">{firstHalf}</strong>
                <span>{secondHalf}</span>
                <span>{punctuation} </span>
            </span>
        );
    };

    const words = text.split(/\s+/);

    return (
        <div className={className}>
            {words.map((word, idx) => (
                <React.Fragment key={`${word}-${idx}`}>
                    {processWord(word)}
                </React.Fragment>
            ))}
        </div>
    );
};

export default BionicText;
