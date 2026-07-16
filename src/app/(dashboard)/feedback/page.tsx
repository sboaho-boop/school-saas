'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { MessageSquareText, Send, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function FeedbackPage() {
  const user = useAuthStore((s) => s.currentUser);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSending(true); setError(''); setSent(false);
    try {
      await api.post('/super/feedback', {
        schoolId: (user as any)?.schoolId || '',
        userId: user?.id || '',
        userName: user?.name || '',
        userEmail: user?.email || '',
        schoolName: '', // will be filled by school lookup
        subject,
        message,
      });
      setSent(true);
      setSubject(''); setMessage('');
    } catch (err: any) {
      setError(err.message);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-gradient-to-r from-purple-500/10 via-primary/10 to-pink-500/10 p-6 text-center"
      >
        <MessageSquareText size={40} className="mx-auto mb-3 text-primary" />
        <h1 className="text-2xl font-bold">Send Feedback</h1>
        <p className="text-muted-foreground">Report an issue, suggest a feature, or send a message to the platform administrators.</p>
      </motion.div>

      {sent ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle size={48} className="mx-auto text-emerald-500" />
            <h2 className="text-xl font-semibold">Feedback Sent!</h2>
            <p className="text-muted-foreground">Thank you. The admin team will review and respond.</p>
            <Button variant="outline" onClick={() => setSent(false)}>Send Another</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Bug report, Feature request, Question" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y"
                  placeholder="Describe your issue or feedback in detail..."
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={sending} className="w-full">
                <Send size={16} className="mr-2" />
                {sending ? 'Sending...' : 'Send Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
