import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Check, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ThumbnailCardProps {
    imageUrl: string;
    index: number;
    prompt: string;
}

export function ThumbnailCard({ imageUrl, index, prompt }: ThumbnailCardProps) {
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleDownload = async () => {
        try {
            // Convert base64 to blob and download
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `thumbnail-${index + 1}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Thumbnail downloaded!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download thumbnail');
        }
    };

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            toast.success('Prompt copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy error:', error);
            toast.error('Failed to copy prompt');
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative image-card"
            >
                {/* Main Image Card */}
                <div className="thumbnail-aspect rounded-xl overflow-hidden bg-card border border-border/50 relative">
                    <img
                        src={imageUrl}
                        alt={`Generated thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">
                                    Thumbnail {index + 1}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                        onClick={handleCopyPrompt}
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-accent" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                        onClick={() => setIsFullscreen(true)}
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        className="h-8 w-8 gradient-bg hover:opacity-90"
                                        onClick={handleDownload}
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-medium bg-black/50 backdrop-blur-sm rounded-md text-white">
                            #{index + 1}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Fullscreen Dialog */}
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogContent className="max-w-5xl w-[95vw] p-0 bg-transparent border-0">
                    <div className="relative">
                        <img
                            src={imageUrl}
                            alt={`Generated thumbnail ${index + 1} fullscreen`}
                            className="w-full h-auto rounded-xl"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                                size="icon"
                                className="gradient-bg hover:opacity-90"
                                onClick={handleDownload}
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <DialogClose asChild>
                                <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70">
                                    <X className="w-5 h-5" />
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
