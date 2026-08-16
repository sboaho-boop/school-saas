'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { MessageSquareText, Send, CheckCircle, History, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/stores/locale';

interface FeedbackItem {
  id: string; subject: string; message: string; status: string;
  reply: string | null; repliedAt: string | null; createdAt: string;
  assignedTo: { name: string } | null;
}

export default function FeedbackPage() {
  const user = useAuthStore((s) => s.currentUser);
  const { t } = useI18n();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const userEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('edu_email') : null);

  const fetchHistory = async () => {
    if (!userEmail) return;
    setLoadingHistory(true);
    try {
      const items = await api.get<FeedbackItem[]>(`/super/feedback/mine?email=${encodeURIComponent(userEmail)}`);
      setHistory(items);
    } catch { /* ignore */ }
    setLoadingHistory(false);
  };

  useEffect(() => { if (showHistory) fetchHistory(); }, [showHistory]);

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
        schoolName: '',
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
        <h1 className="text-2xl font-bold">{t('pages.feedback')}</h1>
        <p className="text-muted-foreground">Report an issue, suggest a feature, or send a message to the platform administrators.</p>
      </motion.div>

      {sent ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle size={48} className="mx-auto text-emerald-500" />
            <h2 className="text-xl font-semibold">Feedback Sent!</h2>
            <p className="text-muted-foreground">Thank you. The admin team will review and respond. You'll get an email when they reply.</p>
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

      <div className="border-t pt-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
        >
          <History size={16} />
          <span>Your previous feedback ({history.length})</span>
          {showHistory ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-3">
            {loadingHistory ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No previous feedback.</p>
            ) : (
              history.map((fb) => (
                <Card key={fb.id} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{fb.subject}</span>
                        <Badge variant={fb.status === 'open' ? 'default' : fb.status === 'resolved' ? 'secondary' : 'outline'} className="text-[10px]">{fb.status}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{fb.message}</p>
                    {fb.reply && (
                      <div className="rounded-md bg-primary/5 p-3 text-sm space-y-1 border-l-2 border-primary">
                        <p className="text-xs font-medium text-primary">Reply from {fb.assignedTo?.name || 'Admin'}{fb.repliedAt ? ` (${new Date(fb.repliedAt).toLocaleDateString()})` : ''}</p>
                        <p className="text-sm">{fb.reply}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
