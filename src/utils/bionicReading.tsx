/**
 * Bionic Reading Utility
 * Bolds the first half of each word to improve reading speed and comprehension
 */

import React from 'react';

export const applyBionicReading = (text: string): string => {
  if (!text) return '';

  // Split text into words while preserving spaces and punctuation
  const words = text.split(/(\s+)/);

  const bionicWords = words.map((word) => {
    // Skip if it's just whitespace
    if (/^\s+$/.test(word)) return word;

    // Extract actual word from punctuation
    const match = word.match(/^([^\w]*)(\w+)([^\w]*)$/);
    if (!match) return word;

    const [, prefix, actualWord, suffix] = match;

    // Calculate split point (first half of word)
    const splitPoint = Math.ceil(actualWord.length / 2);
    const boldPart = actualWord.slice(0, splitPoint);
    const normalPart = actualWord.slice(splitPoint);

    return `${prefix}<strong>${boldPart}</strong>${normalPart}${suffix}`;
  });

  return bionicWords.join('');
};

/**
 * React component wrapper for bionic reading
 */
interface BionicTextProps {
  children: string;
  enabled: boolean;
}

export const BionicText: React.FC<BionicTextProps> = ({
  children,
  enabled,
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  const bionicHTML = applyBionicReading(children);

  return <span dangerouslySetInnerHTML={{ __html: bionicHTML }} />;
};