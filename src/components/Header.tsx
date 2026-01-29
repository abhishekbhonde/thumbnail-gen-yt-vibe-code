import { useState } from 'react';
import { Youtube, Settings, History, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { validateApiKey } from '@/services/geminiService';
import { toast } from 'sonner';

interface HeaderProps {
    onShowHistory: () => void;
}

export function Header({ onShowHistory }: HeaderProps) {
    const { apiKey, setApiKey } = useAppStore();
    const [tempApiKey, setTempApiKey] = useState(apiKey);
    const [isValidating, setIsValidating] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleSaveApiKey = async () => {
        if (!tempApiKey.trim()) {
            toast.error('Please enter an API key');
            return;
        }

        setIsValidating(true);
        const result = await validateApiKey(tempApiKey.trim());
        setIsValidating(false);

        if (result.valid) {
            setApiKey(tempApiKey.trim());
            setDialogOpen(false);
            toast.success('API key saved successfully!');
        } else {
            toast.error(result.error || 'Invalid API key');
        }
    };

    const handleClearApiKey = () => {
        setApiKey('');
        setTempApiKey('');
        toast.success('API key cleared');
        setDialogOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-background border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                            <Youtube className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-bold">ThumbCraft AI</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onShowHistory}
                        >
                            <History className="w-4 h-4" />
                        </Button>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Settings className="w-4 h-4" />
                                    {apiKey && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>API Configuration</DialogTitle>
                                    <DialogDescription>
                                        Enter your Google AI Studio API key.
                                        Get it from <a href="https://aistudio.google.com/apikey" target="_blank" className="text-primary underline">Google AI Studio</a>.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apiKey">API Key</Label>
                                        <div className="relative">
                                            <Input
                                                id="apiKey"
                                                type={showKey ? 'text' : 'password'}
                                                placeholder="Enter API key..."
                                                value={tempApiKey}
                                                onChange={(e) => setTempApiKey(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKey(!showKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            >
                                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveApiKey}
                                            disabled={isValidating}
                                            className="flex-1"
                                        >
                                            {isValidating ? 'Validating...' : 'Save API Key'}
                                        </Button>
                                        {apiKey && (
                                            <Button
                                                variant="ghost"
                                                onClick={handleClearApiKey}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </header>
    );
}
