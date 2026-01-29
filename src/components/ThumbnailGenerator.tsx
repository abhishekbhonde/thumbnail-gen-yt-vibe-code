import { useState, useCallback } from 'react';
import {
    RefreshCw,
    Image as ImageIcon,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { generateThumbnails } from '@/services/geminiService';
import { toast } from 'sonner';
import { ThumbnailCard } from './ThumbnailCard';

const EXAMPLE_PROMPTS = [
    "Tech review thumbnail with minimalistic design",
    "Gaming thumbnail featuring a character in an epic pose",
    "Cooking vlog thumbnail showing a fresh dish",
    "Travel thumbnail with a beautiful scenic landscape",
];

const STYLE_PRESETS = [
    { label: 'Vibrant', value: 'vibrant colors, high contrast' },
    { label: 'Minimal', value: 'clean, minimalist design' },
    { label: 'Cinematic', value: 'cinematic lighting, dramatic' },
];

export function ThumbnailGenerator() {
    const { apiKey, isGenerating, setIsGenerating, addGeneratedImages, addToPromptHistory } = useAppStore();
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);

    const handleGenerate = useCallback(async () => {
        if (!apiKey) {
            toast.error('Please add your API key in settings');
            return;
        }

        if (!prompt.trim()) {
            toast.error('Please enter a description');
            return;
        }

        setIsGenerating(true);
        setGeneratedUrls([]);

        const fullPrompt = selectedStyle
            ? `${prompt}.Style: ${selectedStyle} `
            : prompt;

        toast.loading('Generating thumbnails...', { id: 'generating' });

        const result = await generateThumbnails(apiKey, fullPrompt, 3);

        setIsGenerating(false);
        toast.dismiss('generating');

        if (result.success && result.images) {
            setGeneratedUrls(result.images);
            addToPromptHistory(prompt);

            const newImages = result.images.map((url, index) => ({
                id: `${Date.now()} -${index} `,
                url,
                prompt: fullPrompt,
                timestamp: Date.now(),
                aspectRatio: '16:9',
            }));
            addGeneratedImages(newImages);

            toast.success('Successfully generated thumbnails!');
        } else {
            toast.error(result.error || 'Failed to generate images');
        }
    }, [apiKey, prompt, selectedStyle, setIsGenerating, addGeneratedImages, addToPromptHistory]);

    const handleExampleClick = (example: string) => {
        setPrompt(example);
    };

    const handleStyleClick = (style: string) => {
        setSelectedStyle(selectedStyle === style ? '' : style);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="prompt">Thumbnail Description</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrompt(EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)])}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Random Idea
                            </Button>
                        </div>
                        <Textarea
                            id="prompt"
                            placeholder="Describe what you want in your thumbnail..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[100px]"
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Style Presets</Label>
                        <div className="flex flex-wrap gap-2">
                            {STYLE_PRESETS.map((style) => (
                                <Badge
                                    key={style.label}
                                    variant={selectedStyle === style.value ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => handleStyleClick(style.value)}
                                >
                                    {style.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full"
                    >
                        {isGenerating ? 'Generating...' : 'Generate 3 Thumbnails'}
                    </Button>

                    {!apiKey && (
                        <div className="flex items-center gap-2 p-3 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">Please set your API key in the settings above.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold px-1">Example Prompts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EXAMPLE_PROMPTS.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => handleExampleClick(example)}
                            className="text-left p-3 rounded border text-sm hover:bg-muted transition-colors"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </div>

            {(generatedUrls.length > 0 || isGenerating) && (
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Generated Results
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {isGenerating && generatedUrls.length === 0 ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="thumbnail-aspect rounded bg-muted animate-pulse" />
                            ))
                        ) : (
                            generatedUrls.map((url, index) => (
                                <ThumbnailCard
                                    key={index}
                                    imageUrl={url}
                                    index={index}
                                    prompt={prompt}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
