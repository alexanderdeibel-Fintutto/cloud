import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <Leaf className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Diese Seite wurde leider nicht gefunden.</p>
      <Button asChild>
        <Link to="/">Zurück zum Dashboard</Link>
      </Button>
    </div>
  );
}
