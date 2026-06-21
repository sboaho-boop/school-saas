'use client';

import { useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

interface StudentCard {
  studentId: string;
  studentName: string;
  cardUid: string;
  photoUrl?: string;
  schoolName?: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<StudentCard[]>([]);
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ name: string }>('/auth/me').then((u: any) => setSchoolName(u.schoolName || u.name || '')),
      api.get<any[]>('/wallet').then((wallets) => {
        setCards(wallets.filter((w: any) => w.cardUid).map((w: any) => ({
          studentId: w.studentId,
          studentName: w.studentName,
          cardUid: w.cardUid,
          photoUrl: w.student?.photoUrl || '',
        })));
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const downloadZpl = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/wallet/zpl-bulk`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-cards.zpl';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCardZpl = async (studentId: string) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/wallet/zpl/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentId}.zpl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading cards...</div>;

  return (
    <div>
      <div className="no-print flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold">Student ID Cards</h1>
          <p className="text-muted-foreground">{cards.length} card{cards.length !== 1 ? 's' : ''} ready to print</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadZpl}>
          <Download size={14} className="mr-1" />ZPL (Zebra)
        </Button>
        <Button onClick={() => window.print()}>
          <Printer size={16} className="mr-2" />Print Cards
        </Button>
      </div>
      <div className="card-grid p-6 pt-0">
        {cards.map((card, i) => (
          <div key={i} className="id-card">
            <div className="id-card-school">{schoolName || 'EduPlatform'}</div>
            <div className="id-card-photo">
              {card.photoUrl ? (
                <img src={card.photoUrl} alt={card.studentName} />
              ) : (
                <div className="id-card-photo-placeholder">
                  {card.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="id-card-name">{card.studentName}</div>
            <div className="id-card-uid">{card.cardUid}</div>
            <button onClick={() => downloadCardZpl(card.studentId)} className="id-card-zpl">Download ZPL</button>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 0.5in; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
        }
        .id-card {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          background: white;
          page-break-inside: avoid;
          break-inside: avoid;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .id-card-school {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6366f1;
          border-bottom: 2px solid #6366f1;
          padding-bottom: 0.3rem;
          width: 100%;
        }
        .id-card-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #e2e8f0;
          background: #f1f5f9;
        }
        .id-card-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .id-card-photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.3rem;
          color: #94a3b8;
        }
        .id-card-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: #1e293b;
        }
        .id-card-uid {
          font-family: monospace;
          font-size: 0.65rem;
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          color: #64748b;
          letter-spacing: 0.05em;
        }
        .id-card-zpl {
          font-size: 0.6rem;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #6366f1;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.15s;
        }
        .id-card-zpl:hover { background: #eef2ff; border-color: #6366f1; }
        @media print {
          .card-grid { gap: 0.6rem; }
          .id-card { border-color: #cbd5e1; padding: 0.6rem; }
          .id-card-photo { width: 70px; height: 70px; }
          .id-card-zpl { display: none !important; }
        }
      `}</style>
    </div>
  );
}
