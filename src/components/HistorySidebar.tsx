import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, Clock, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
    const { generatedImages, removeImage, clearHistory } = useAppStore();

    const handleDownloadImage = async (url: string, index: number) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `thumbnail-${index + 1}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            toast.success('Image downloaded!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download image');
        }
    };

    const handleDownloadAll = async () => {
        if (generatedImages.length === 0) {
            toast.error('No images to download');
            return;
        }

        try {
            const zip = new JSZip();
            const folder = zip.folder('thumbnails');

            for (let i = 0; i < generatedImages.length; i++) {
                const img = generatedImages[i];
                const response = await fetch(img.url);
                const blob = await response.blob();
                folder?.file(`thumbnail-${i + 1}.png`, blob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `thumbnails-${Date.now()}.zip`);
            toast.success('All thumbnails downloaded!');
        } catch (error) {
            console.error('Download all error:', error);
            toast.error('Failed to download thumbnails');
        }
    };

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all history?')) {
            clearHistory();
            toast.success('History cleared');
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">History</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {generatedImages.length} thumbnails
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Actions */}
                        {generatedImages.length > 0 && (
                            <div className="flex gap-2 p-4 border-b border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleDownloadAll}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                    onClick={handleClearHistory}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Content */}
                        <ScrollArea className="flex-1">
                            {generatedImages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-medium mb-2">No thumbnails yet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your generated thumbnails will appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {generatedImages.map((image, index) => (
                                        <motion.div
                                            key={image.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all"
                                        >
                                            <div className="thumbnail-aspect">
                                                <img
                                                    src={image.url}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all">
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <p className="text-xs text-white/80 line-clamp-2 mb-2">
                                                        {image.prompt}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-white/60">
                                                            {formatDate(image.timestamp)}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="icon"
                                                                className="h-7 w-7 gradient-bg hover:opacity-90"
                                                                onClick={() => handleDownloadImage(image.url, index)}
                                                            >
                                                                <Download className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                className="h-7 w-7 bg-white/20 hover:bg-destructive/50"
                                                                onClick={() => removeImage(image.id)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer */}
                        <Separator />
                        <div className="p-4">
                            <p className="text-xs text-center text-muted-foreground">
                                History is stored locally on your device
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
