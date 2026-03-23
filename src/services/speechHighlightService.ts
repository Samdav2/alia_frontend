// Speech Highlight Service - Synchronizes text highlighting with speech
// Highlights words as they are being spoken for better user engagement

export interface HighlightOptions {
  wordsPerMinute?: number;
  highlightColor?: string;
  animationDuration?: number;
}

class SpeechHighlightService {
  private currentHighlight: HTMLElement | null = null;
  private highlightInterval: NodeJS.Timeout | null = null;
  private isHighlighting: boolean = false;

  // Start highlighting text synchronized with speech
  startHighlighting(
    text: string,
    containerSelector: string = '.prose',
    options: HighlightOptions = {}
  ) {
    const {
      wordsPerMinute = 150,
      highlightColor = 'bg-yellow-300',
      animationDuration = 300
    } = options;

    this.stopHighlighting();
    this.isHighlighting = true;

    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('Container not found for highlighting');
      return;
    }

    // Split text into words
    const words = text.trim().split(/\s+/);
    const millisecondsPerWord = (60 / wordsPerMinute) * 1000;

    // Create highlighted version of the text
    this.createHighlightableText(container, text);

    // Start highlighting words sequentially
    let currentWordIndex = 0;

    const highlightNextWord = () => {
      if (!this.isHighlighting || currentWordIndex >= words.length) {
        this.stopHighlighting();
        return;
      }

      // Remove previous highlight
      if (this.currentHighlight) {
        this.currentHighlight.classList.remove(highlightColor, 'transition-all', 'duration-300', 'scale-105');
      }

      // Find and highlight current word
      const wordElement = container.querySelector(`[data-word-index="${currentWordIndex}"]`) as HTMLElement;
      if (wordElement) {
        wordElement.classList.add(highlightColor, 'transition-all', 'duration-300', 'scale-105', 'rounded', 'px-1');
        this.currentHighlight = wordElement;

        // Scroll word into view if needed
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }

      currentWordIndex++;
      this.highlightInterval = setTimeout(highlightNextWord, millisecondsPerWord);
    };

    // Start highlighting after a brief delay
    setTimeout(highlightNextWord, 500);
  }

  // Create highlightable text by wrapping each word in a span
  private createHighlightableText(container: Element, text: string) {
    // DISABLED: This method causes DOM manipulation conflicts with React's virtual DOM
    // Highlighting is now disabled in textToSpeechService.readContent()
    console.debug('Speech highlighting temporarily disabled to prevent React conflicts');
    return;

    // Original implementation (commented out for safety):
    // const words = text.trim().split(/\s+/);
    // const highlightedHTML = words.map((word, index) => {
    //   const cleanWord = word.replace(/[.,!?;:]/g, '');
    //   const punctuation = word.replace(cleanWord, '');
    //   return `<span data-word-index="${index}" class="inline-block cursor-pointer hover:bg-blue-100 transition-colors duration-200">${cleanWord}</span>${punctuation}`;
    // }).join(' ');
    // const contentArea = container.querySelector('.space-y-4') || container;
    // if (contentArea) {
    //   contentArea.innerHTML = `<div class="leading-relaxed text-lg sm:text-xl">${highlightedHTML}</div>`;
    // }
  }

  // Stop highlighting and cleanup
  stopHighlighting() {
    this.isHighlighting = false;

    if (this.highlightInterval) {
      clearTimeout(this.highlightInterval);
      this.highlightInterval = null;
    }

    if (this.currentHighlight) {
      this.currentHighlight.classList.remove(
        'bg-yellow-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300',
        'transition-all', 'duration-300', 'scale-105', 'rounded', 'px-1'
      );
      this.currentHighlight = null;
    }
  }

  // Check if currently highlighting
  isActive(): boolean {
    return this.isHighlighting;
  }

  // Highlight specific word by index
  highlightWord(wordIndex: number, color: string = 'bg-yellow-300') {
    const wordElement = document.querySelector(`[data-word-index="${wordIndex}"]`) as HTMLElement;
    if (wordElement) {
      // Remove previous highlights
      document.querySelectorAll('[data-word-index]').forEach(el => {
        el.classList.remove('bg-yellow-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300', 'scale-105', 'rounded', 'px-1');
      });

      // Add new highlight
      wordElement.classList.add(color, 'transition-all', 'duration-300', 'scale-105', 'rounded', 'px-1');
      this.currentHighlight = wordElement;

      // Scroll into view
      wordElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  // Get total word count from current text
  getWordCount(): number {
    return document.querySelectorAll('[data-word-index]').length;
  }

  // Jump to specific word percentage
  jumpToPercentage(percentage: number) {
    const totalWords = this.getWordCount();
    const targetWord = Math.floor((percentage / 100) * totalWords);
    this.highlightWord(targetWord);
  }
}

export const speechHighlightService = new SpeechHighlightService();
