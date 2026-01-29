import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ThumbnailGenerator } from '@/components/ThumbnailGenerator';
import { HistorySidebar } from '@/components/HistorySidebar';
import { Footer } from '@/components/Footer';

function App() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          },
        }}
      />

      {/* Header */}
      <Header onShowHistory={() => setIsHistoryOpen(true)} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Generator Section */}
        <section className="mt-12">
          <ThumbnailGenerator />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

export default App;
