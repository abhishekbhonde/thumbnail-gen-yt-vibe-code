import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GeneratedImage {
    id: string;
    url: string;
    prompt: string;
    timestamp: number;
    aspectRatio: string;
}

interface AppState {
    apiKey: string;
    setApiKey: (key: string) => void;
    generatedImages: GeneratedImage[];
    addGeneratedImages: (images: GeneratedImage[]) => void;
    removeImage: (id: string) => void;
    clearHistory: () => void;
    isGenerating: boolean;
    setIsGenerating: (val: boolean) => void;
    promptHistory: string[];
    addToPromptHistory: (prompt: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            apiKey: '',
            setApiKey: (key: string) => set({ apiKey: key }),
            generatedImages: [],
            addGeneratedImages: (images: GeneratedImage[]) =>
                set({ generatedImages: [...images, ...get().generatedImages] }),
            removeImage: (id: string) =>
                set({ generatedImages: get().generatedImages.filter((img) => img.id !== id) }),
            clearHistory: () => set({ generatedImages: [] }),
            isGenerating: false,
            setIsGenerating: (val: boolean) => set({ isGenerating: val }),
            promptHistory: [],
            addToPromptHistory: (prompt: string) => {
                const history = get().promptHistory;
                const newHistory = [prompt, ...history.filter((p) => p !== prompt)].slice(0, 20);
                set({ promptHistory: newHistory });
            },
        }),
        {
            name: 'yt-thumbnail-storage',
            partialize: (state) => ({
                apiKey: state.apiKey,
                generatedImages: state.generatedImages.slice(0, 50),
                promptHistory: state.promptHistory,
            }),
        }
    )
);
