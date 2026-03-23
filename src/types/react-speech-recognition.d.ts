// Type declaration for react-speech-recognition
// This package doesn't ship its own @types
declare module 'react-speech-recognition' {
    interface SpeechRecognitionOptions {
        commands?: Command[];
    }

    interface Command {
        command: string | string[] | RegExp;
        callback: (...args: any[]) => void;
        isFuzzyMatch?: boolean;
        matchInterim?: boolean;
        fuzzyMatchingThreshold?: number;
        bestMatchOnly?: boolean;
    }

    interface SpeechRecognitionHookReturn {
        transcript: string;
        interimTranscript: string;
        finalTranscript: string;
        listening: boolean;
        resetTranscript: () => void;
        browserSupportsSpeechRecognition: boolean;
        isMicrophoneAvailable: boolean;
    }

    export function useSpeechRecognition(
        options?: SpeechRecognitionOptions
    ): SpeechRecognitionHookReturn;

    const SpeechRecognition: {
        startListening: (options?: { continuous?: boolean; language?: string }) => Promise<void>;
        stopListening: () => Promise<void>;
        abortListening: () => Promise<void>;
        browserSupportsSpeechRecognition: () => boolean;
    };

    export default SpeechRecognition;
}
