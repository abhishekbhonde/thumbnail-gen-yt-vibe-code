export function Footer() {
    return (
        <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
            <div className="container mx-auto px-4 space-y-4">
                <p>&copy; {new Date().getFullYear()} ThumbCraft AI. All rights reserved.</p>
                <div className="flex justify-center gap-4">
                    <a href="#" className="hover:text-foreground">Terms</a>
                    <a href="#" className="hover:text-foreground">Privacy</a>
                </div>
                <div className="pt-4 border-t border-border max-w-xl mx-auto">
                    <p className="opacity-50 text-xs">Advertisement</p>
                    <div className="h-20 bg-muted/50 rounded mt-2 flex items-center justify-center">
                        Ad Space
                    </div>
                </div>
            </div>
        </footer>
    );
}
