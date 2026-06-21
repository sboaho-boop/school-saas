'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useCallback, useEffect } from 'react';
import { useWalletStore } from '@/stores/wallet';
import { useStudentStore } from '@/stores/students';
import { useAcademicsStore } from '@/stores/academics';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Check, X, CreditCard, Bus, UtensilsCrossed, Printer, School, ArrowLeft, KeyRound, SmartphoneNfc, Usb, PenTool, BookOpen, Save, IdCard, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';

const services = [
  { id: 'attendance', label: 'Attendance', icon: Scan, color: 'bg-emerald-500 hover:bg-emerald-600', textColor: 'text-white' },
  { id: 'canteen', label: 'Canteen', icon: UtensilsCrossed, color: 'bg-orange-500 hover:bg-orange-600', textColor: 'text-white' },
  { id: 'transport', label: 'Transport', icon: Bus, color: 'bg-sky-500 hover:bg-sky-600', textColor: 'text-white' },
  { id: 'printing', label: 'Printing', icon: Printer, color: 'bg-purple-500 hover:bg-purple-600', textColor: 'text-white' },
  { id: 'fees', label: 'School Fees', icon: School, color: 'bg-rose-500 hover:bg-rose-600', textColor: 'text-white' },
  { id: 'marks', label: 'Mark Entry', icon: PenTool, color: 'bg-indigo-500 hover:bg-indigo-600', textColor: 'text-white' },
  { id: 'staff-checkin', label: 'Staff Check-In', icon: UserCheck, color: 'bg-amber-500 hover:bg-amber-600', textColor: 'text-white' },
];

export default function TerminalPage() {
  const { tapCard, tapConfirm, generateCard, wallets, fetchWallets } = useWalletStore();
  const { students, fetchStudents } = useStudentStore();
  const [service, setService] = useState('');
  const [uid, setUid] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string; balance?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [tapToken, setTapToken] = useState('');
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'use' | 'encode' | 'issue'>('use');
  const [encodeUid, setEncodeUid] = useState('');
  const [encodeResult, setEncodeResult] = useState('');
  const [issueStudent, setIssueStudent] = useState('');
  const [issueResult, setIssueResult] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);

  // Mark entry via NFC
  const subjects = useAcademicsStore((s) => s.subjects);
  const terms = useAcademicsStore((s) => s.terms);
  const fetchSubjects = useAcademicsStore((s) => s.fetchSubjects);
  const fetchTerms = useAcademicsStore((s) => s.fetchTerms);
  const [markSubject, setMarkSubject] = useState('');
  const [markTerm, setMarkTerm] = useState('');
  const [markStudent, setMarkStudent] = useState<{ id: string; name: string; classId: string } | null>(null);
  const [markComps, setMarkComps] = useState<Record<string, string>>({});
  const [markResult, setMarkResult] = useState('');

  useEffect(() => { fetchSubjects(); fetchTerms(); fetchWallets(); fetchStudents(); }, [fetchSubjects, fetchTerms, fetchWallets, fetchStudents]);
  const unlinked = students.filter((s) => !wallets.find((w) => w.studentId === s.id));

  const handleUidForMarks = useCallback(async (cardUid: string) => {
    // Find student by card UID via wallet
    try {
      const wallets = await api.get<any[]>('/wallet');
      const wallet = wallets.find((w: any) => w.cardUid === cardUid || w.wristbandUid === cardUid);
      if (wallet) {
        setMarkStudent({ id: wallet.studentId, name: wallet.studentName, classId: wallet.classId || '' });
        setMarkSubject('');
        setMarkComps({});
        setMarkResult('');
      } else {
        setMarkResult('Card not linked to any student');
      }
    } catch {
      setMarkResult('Failed to look up card');
    }
  }, []);

  const handleMarkSave = useCallback(async () => {
    if (!markStudent || !markSubject || !markTerm) return;
    try {
      await api.post('/marks', {
        studentId: markStudent.id,
        subjectId: markSubject,
        classId: markStudent.classId,
        termId: markTerm,
        components: markComps,
        score: 0,
        grade: '',
        remarks: '',
      });
      setMarkResult('Saved!');
      setTimeout(() => { setMarkResult(''); setMarkComps({}); setMarkStudent(null); setMarkSubject(''); }, 2000);
    } catch (err: any) {
      setMarkResult(err.message || 'Failed to save');
    }
  }, [markStudent, markSubject, markTerm, markComps]);

  const handleTap = async () => {
    if (!uid || !service) return;
    setLoading(true);
    setResult(null);
    try {
      const isPayment = service !== 'attendance';
      const res = await tapCard(uid, service, isPayment ? parseFloat(amount) || 0 : 0, 'tablet-01');
      if (res.pinRequired) {
        setTapToken(res.tapToken);
        setPin('');
        setLoading(false);
        return;
      }
      setResult({ ok: true, message: res.message || 'Success', balance: res.balance });
      if (isPayment) setAmount('');
      setUid('');
    } catch (err: any) {
      setResult({ ok: false, message: err.message || 'Failed' });
    } finally {
      setLoading(false);
      if (!tapToken) setTimeout(() => setResult(null), 4000);
    }
  };

  const handlePinSubmit = async () => {
    if (!tapToken || !pin) return;
    setLoading(true);
    try {
      const res = await tapConfirm(tapToken, pin);
      setResult({ ok: true, message: res.message || 'Payment successful', balance: res.balance });
      setTapToken('');
      setPin('');
      setAmount('');
      setUid('');
    } catch (err: any) {
      setResult({ ok: false, message: err.message || 'Failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setResult(null), 4000);
    }
  };

  const [nfcSupported] = useState(() => typeof window !== 'undefined' && 'NDEFReader' in window);
  const [nfcScanning, setNfcScanning] = useState(false);

  const handleNfcScan = useCallback(async () => {
    if (!('NDEFReader' in window)) return;
    setNfcScanning(true);
    try {
      const reader = new (window as any).NDEFReader();
      await reader.scan();
      reader.addEventListener('readingerror', () => { setNfcScanning(false); });
      reader.addEventListener('reading', ({ message }: any) => {
        const record = message.records[0];
        if (record.recordType === 'text') {
          const decoder = new TextDecoder(record.encoding || 'utf-8');
          const text = decoder.decode(record.data);
          setUid(text);
          if (!text.startsWith('EDU-')) setUid(prev => prev || text);
        } else if (record.recordType === 'url') {
          const decoder = new TextDecoder('utf-8');
          setUid(decoder.decode(record.data));
        }
        setNfcScanning(false);
      });
    } catch {
      setNfcScanning(false);
    }
  }, []);

  const [usbDevice, setUsbDevice] = useState<any>(null);
  const [usbStatus, setUsbStatus] = useState('disconnected');

  const connectUsb = useCallback(async () => {
    if (!('usb' in navigator)) { setUsbStatus('unsupported'); return; }
    try {
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x072F },
          { vendorId: 0x0416 },
          { vendorId: 0x04E6 },
          { vendorId: 0x076B },
          { vendorId: 0x08E6 },
          { vendorId: 0x1E0E },
        ]
      });
      await device.open();
      await device.selectConfiguration(1);
      const iface = device.configuration.interfaces.find((i: any) =>
        i.alternate.endpoints.some((e: any) => e.type === 'bulk')
      ) || device.configuration.interfaces[0];
      await device.claimInterface(iface.interfaceNumber);
      setUsbDevice(device);
      setUsbStatus('connected');
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setUsbStatus('error');
      }
    }
  }, []);

  const sendApdu = useCallback(async (apdu: Uint8Array): Promise<Uint8Array | null> => {
    if (!usbDevice) return null;
    try {
      const iface = usbDevice.configuration.interfaces[0];
      const endpoints = iface.alternate.endpoints;
      const outEp = endpoints.find((e: any) => e.direction === 'out' && e.type === 'bulk');
      const inEp = endpoints.find((e: any) => e.direction === 'in' && e.type === 'bulk');
      if (!outEp || !inEp) return null;

      const ccid = new Uint8Array([
        0x6F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, apdu.length & 0xFF, (apdu.length >> 8) & 0xFF, 0x00, 0x00, 0x00, 0x00,
        ...apdu
      ]);
      await usbDevice.transferOut(outEp.endpointNumber, ccid);
      const resp = await usbDevice.transferIn(inEp.endpointNumber, 256);
      const data = new Uint8Array(resp.data.buffer);
      // RDR_to_PC_XfrBlock: 10 byte header + response
      return data.slice(10);
    } catch { return null; }
  }, [usbDevice]);

  const scanUsbCard = useCallback(async () => {
    const resp = await sendApdu(new Uint8Array([0xFF, 0xCA, 0x00, 0x00, 0x00]));
    let scannedUid = '';
    if (resp && resp.length >= 2 && resp[resp.length - 2] === 0x90 && resp[resp.length - 1] === 0x00) {
      const uidBytes = resp.slice(0, resp.length - 2);
      const hex = Array.from(uidBytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
      if (hex.length >= 4) scannedUid = `EDU-${hex}`;
    } else if (resp && resp.length >= 2) {
      const readResp = await sendApdu(new Uint8Array([0xFF, 0xB0, 0x00, 0x04, 0x10]));
      if (readResp && readResp.length >= 2 && readResp[readResp.length - 2] === 0x90 && readResp[readResp.length - 1] === 0x00) {
        const data = readResp.slice(0, readResp.length - 2);
        const tlvIdx = data.indexOf(0x03);
        if (tlvIdx >= 0 && data.length > tlvIdx + 2) {
          const ndefLen = data[tlvIdx + 1];
          const ndefData = data.slice(tlvIdx + 2, tlvIdx + 2 + ndefLen);
          const textStart = ndefData.indexOf(0x54);
          if (textStart >= 0 && ndefData.length > textStart + 3) {
            const textBytes = ndefData.slice(textStart + 5);
            scannedUid = new TextDecoder().decode(textBytes).replace(/\0/g, '').trim();
          }
        }
      }
    }
    if (scannedUid) {
      setUid(scannedUid);
      if (service === 'marks') {
        setTimeout(() => handleUidForMarks(scannedUid), 100);
      } else {
        setTimeout(() => handleTapWithUid(scannedUid), 100);
      }
    }
  }, [sendApdu, service]);

  const writeNdefToCard = useCallback(async (textToWrite: string) => {
    if (!textToWrite) return;
    setEncodeResult('writing...');
    try {
      const enc = new TextEncoder();
      const lang = 'en';
      const langEncoded = enc.encode(lang);
      const statusByte = new Uint8Array([0x02]); // UTF-8
      const textEncoded = enc.encode(textToWrite);
      const payload = new Uint8Array([...statusByte, ...langEncoded, ...textEncoded]);
      // NDEF well-known text record, short record (SR=1)
      const record = new Uint8Array([
        0xD1, // MB=1, ME=1, CF=0, SR=1, IL=0, TNF=0x01
        0x01, // type length ('T')
        payload.length, // payload length
        0x54, // 'T'
        ...payload
      ]);
      // TLV: 0x03 NDEF, length, data
      const tlvData = new Uint8Array([0x03, record.length, ...record]);
      // Pad to 4 bytes and add terminator TLV
      const paddedLen = Math.ceil((tlvData.length + 1) / 4) * 4;
      const padded = new Uint8Array(paddedLen);
      padded.set(tlvData);
      padded[tlvData.length] = 0xFE; // Terminator TLV

      // Write in 4-byte blocks starting at page 4
      for (let i = 0; i < paddedLen; i += 4) {
        const block = Math.floor(i / 4) + 4;
        const chunk = padded.slice(i, i + 4);
        // Pad last chunk if needed
        const writeData = chunk.length === 4 ? chunk : new Uint8Array([...chunk, 0x00, 0x00, 0x00, 0x00]).slice(0, 4);
        const apdu = new Uint8Array([0xFF, 0xD6, 0x00, block, 0x04, ...writeData]);
        const resp = await sendApdu(apdu);
        if (!resp || resp[resp.length - 2] !== 0x90 || resp[resp.length - 1] !== 0x00) {
          setEncodeResult('write failed at block ' + block);
          return;
        }
      }
      setEncodeResult('done');
      setTimeout(() => { setEncodeResult(''); setEncodeUid(''); }, 3000);
    } catch {
      setEncodeResult('error');
    }
  }, [sendApdu]);

  const handleTapWithUid = async (cardUid: string) => {
    if (!cardUid || !service) return;
    setLoading(true);
    setResult(null);
    try {
      if (service === 'staff-checkin') {
        const res = await api.post<{ staff: string; role: string }>('/staff/tap', { uid: cardUid });
        setResult({ ok: true, message: `${res.staff} checked in — ${res.role}` });
        setUid('');
        return;
      }
      const isPayment = service !== 'attendance';
      const res = await tapCard(cardUid, service, isPayment ? parseFloat(amount) || 0 : 0, 'tablet-01');
      if (res.pinRequired) {
        setTapToken(res.tapToken);
        setPin('');
        setLoading(false);
        return;
      }
      setResult({ ok: true, message: res.message || 'Success', balance: res.balance });
      if (isPayment) setAmount('');
      setUid('');
    } catch (err: any) {
      setResult({ ok: false, message: err.message || 'Failed' });
    } finally {
      setLoading(false);
      if (!tapToken) setTimeout(() => setResult(null), 4000);
    }
  };

  const reset = () => { setService(''); setUid(''); setAmount(''); setResult(null); setTapToken(''); setPin(''); setEncodeUid(''); setEncodeResult(''); setMarkStudent(null); setMarkSubject(''); setMarkComps({}); setMarkResult(''); setIssueStudent(''); setIssueResult(''); setIssueLoading(false); };

  if (!service) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <Scan size={48} className="mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold">Tap Terminal</h1>
          <p className="text-muted-foreground">Select a service to begin</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg w-full">
          {services.map((s) => (
            <motion.div key={s.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button onClick={() => { setService(s.id); setMode('use'); }} className={`${s.color} ${s.textColor} rounded-2xl p-8 w-full flex flex-col items-center gap-3 shadow-lg transition-all`}>
                <s.icon size={36} />
                <span className="text-lg font-semibold">{s.label}</span>
              </button>
            </motion.div>
          ))}
          {/* Card Encoder button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button onClick={() => { setService('encoder'); setMode('encode'); }} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl p-8 w-full flex flex-col items-center gap-3 shadow-lg transition-all">
              <PenTool size={36} />
              <span className="text-lg font-semibold">Card Encoder</span>
            </button>
          </motion.div>
          {/* Issue Card button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button onClick={() => { setService('issue'); setMode('issue'); }} className="bg-teal-500 hover:bg-teal-600 text-white rounded-2xl p-8 w-full flex flex-col items-center gap-3 shadow-lg transition-all">
              <IdCard size={36} />
              <span className="text-lg font-semibold">Issue Card</span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const svc = services.find((s) => s.id === service);
  const isPayment = service !== 'attendance' && service !== 'marks' && service !== 'staff-checkin';

  if (service === 'issue' && mode === 'issue') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={reset}><ArrowLeft size={16} className="mr-1" />Back</Button>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white bg-teal-500">
                <IdCard size={14} /> Issue Card
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Student (no card)</label>
                <select
                  value={issueStudent}
                  onChange={(e) => setIssueStudent(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select student...</option>
                  {unlinked.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.className}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={async () => {
                    if (!issueStudent) return;
                    setIssueLoading(true);
                    setIssueResult('');
                    try {
                      const { cardUid } = await generateCard(issueStudent);
                      setIssueResult(`Generated: ${cardUid}`);
                      if (usbStatus === 'connected') {
                        await writeNdefToCard(cardUid);
                      } else {
                        setIssueResult(`Card UID generated: ${cardUid}\nConnect USB reader to write to NFC tag.`);
                      }
                    } catch (err: any) {
                      setIssueResult(`Error: ${err.message}`);
                    }
                    setIssueLoading(false);
                    fetchWallets();
                  }}
                  disabled={!issueStudent || issueLoading}
                  className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
                >
                  <IdCard size={16} />
                  {issueLoading ? 'Generating & Writing...' : 'Generate & Write to Card'}
                </Button>

                {usbStatus === 'connected' ? (
                  <p className="text-xs text-emerald-600 text-center flex items-center justify-center gap-1">
                    <Usb size={12} /> Reader connected — hold tag on reader and click above
                  </p>
                ) : usbStatus === 'unsupported' ? (
                  <p className="text-xs text-red-500 text-center">WebUSB not supported in this browser</p>
                ) : (
                  <Button onClick={connectUsb} variant="outline" size="sm" className="gap-2">
                    <Usb size={14} /> Connect USB Reader for auto-write
                  </Button>
                )}
              </div>

              {issueResult && (
                <div className="rounded-lg bg-muted p-4 space-y-2 text-center">
                  {issueResult.startsWith('Generated:') || issueResult.startsWith('Card UID') ? (
                    <>
                      <p className="text-sm text-muted-foreground">Card UID:</p>
                      <p className="font-mono font-bold text-lg tracking-wider text-teal-600">
                        {issueResult.match(/EDU-[A-F0-9]+/)?.[0] || '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">Student can now tap this card.</p>
                    </>
                  ) : (
                    <p className="text-sm text-red-500">{issueResult}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (service === 'marks') {
    const classSubjects = markStudent ? subjects.filter((s) => s.classId === markStudent.classId) : [];
    const activeTerm = terms.find((t) => t.isActive);
    if (!markTerm && activeTerm) setMarkTerm(activeTerm.id);

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={reset}><ArrowLeft size={16} className="mr-1" />Back</Button>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white bg-indigo-500">
                <PenTool size={14} /> Mark Entry
              </div>
            </div>

            {!markStudent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">Tap a student's card to begin</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Scan NFC or type card UID..."
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    className="text-center font-mono flex-1"
                    autoFocus
                  />
                  <Button onClick={() => { handleUidForMarks(uid); }} disabled={!uid}>Look Up</Button>
                </div>
                {usbStatus === 'connected' && (
                  <Button variant="outline" className="w-full" onClick={scanUsbCard}>
                    <Usb size={16} className="mr-2 animate-pulse text-green-500" /> Tap Card on Reader
                  </Button>
                )}
                {usbStatus === 'disconnected' && (
                  <Button variant="outline" className="w-full" onClick={connectUsb}>
                    <Usb size={16} className="mr-2" /> Connect USB Reader
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="font-semibold">{markStudent.name}</p>
                </div>

                <Select value={markSubject} onValueChange={(v) => v && setMarkSubject(v)}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {classSubjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name} ({sub.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {markSubject && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {['classExercise', 'homework', 'quiz', 'midterm', 'exam'].map((name) => {
                        const max = { classExercise: 10, homework: 10, quiz: 30, midterm: 20, exam: 30 }[name] || 10;
                        const label = { classExercise: 'Class Ex', homework: 'Hwk', quiz: 'Quiz', midterm: 'Mid-Term', exam: 'Exam' }[name] || name;
                        return (
                          <div key={name} className="space-y-1">
                            <label className="text-xs text-muted-foreground">{label} /{max}</label>
                            <Input
                              type="number" min="0" max={max}
                              placeholder="0"
                              value={markComps[name] ?? ''}
                              onChange={(e) => setMarkComps((p) => ({ ...p, [name]: e.target.value }))}
                              className="text-center"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center text-sm font-semibold">
                      Total: {['classExercise', 'homework', 'quiz', 'midterm', 'exam'].reduce((s, n) => s + (parseFloat(markComps[n]) || 0), 0)}/100
                    </div>

                    <Button className="w-full" onClick={handleMarkSave} disabled={!markSubject}>
                      <Save size={16} className="mr-2" /> Save Score
                    </Button>
                  </div>
                )}

                {markResult && (
                  <div className={`text-center text-sm ${markResult === 'Saved!' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {markResult}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'encode') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={reset}><ArrowLeft size={16} className="mr-1" />Back</Button>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white bg-indigo-500">
                <PenTool size={14} /> Card Encoder
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card UID to write</label>
                <Input
                  placeholder="EDU-A7F3B2C9"
                  value={encodeUid}
                  onChange={(e) => setEncodeUid(e.target.value.toUpperCase().replace(/[^EDU0-9A-F-]/g, '').slice(0, 14))}
                  className="text-center text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the EDU-XXXXX UID generated from the Wallet page
                </p>
              </div>

              <div className="flex gap-2 items-center justify-center">
                {usbStatus === 'connected' ? (
                  <>
                    <Button onClick={() => writeNdefToCard(encodeUid)} disabled={!encodeUid || encodeResult === 'writing...'}
                      className="gap-2">
                      <PenTool size={16} />
                      Write to Card
                    </Button>
                    <Button variant="outline" onClick={scanUsbCard} title="Read card">
                      <Usb size={16} className="animate-pulse text-green-500" />
                    </Button>
                  </>
                ) : usbStatus === 'unsupported' ? (
                  <p className="text-sm text-red-500">WebUSB not supported in this browser</p>
                ) : (
                  <Button onClick={connectUsb} variant="outline" className="gap-2">
                    <Usb size={16} /> Connect USB Reader
                  </Button>
                )}
              </div>

              {encodeResult === 'writing...' && (
                <div className="text-center text-amber-500 text-sm animate-pulse">Writing to card, hold tag on reader...</div>
              )}
              {encodeResult === 'done' && (
                <div className="text-center text-emerald-500 text-sm">Card written successfully!</div>
              )}
              {encodeResult && encodeResult !== 'writing...' && encodeResult !== 'done' && (
                <div className="text-center text-red-500 text-sm">{encodeResult}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={reset}><ArrowLeft size={16} className="mr-1" />Back</Button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white ${svc?.color.split(' ')[0]}`}>
              {svc?.icon && <svc.icon size={14} />}
              {svc?.label}
            </div>
          </div>

          {!tapToken ? (
            <form onSubmit={(e) => { e.preventDefault(); handleTap(); }}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tap or enter Card / Wristband UID</label>
            <div className="flex gap-2">
              <Input
                placeholder="Scan NFC or type UID..."
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                autoFocus
                className="text-center text-lg font-mono flex-1"
              />
              {usbStatus === 'connected' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  onClick={scanUsbCard}
                  title="Read card via USB reader"
                >
                  <Usb size={18} className="animate-pulse text-green-500" />
                </Button>
              ) : usbStatus === 'unsupported' ? null : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  onClick={connectUsb}
                  title="Connect USB NFC reader"
                >
                  <Usb size={18} className={usbStatus === 'error' ? 'text-red-500' : ''} />
                </Button>
              )}
              {nfcSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  onClick={handleNfcScan}
                  disabled={nfcScanning}
                  title="Scan NFC tag via phone"
                >
                  <SmartphoneNfc size={18} className={nfcScanning ? 'animate-pulse' : ''} />
                </Button>
              )}
            </div>
          </div>

          {isPayment && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (GHS)</label>
              <Input
                type="number"
                step="0.5"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center text-lg"
              />
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-lg gap-3" disabled={loading || !uid}>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <CreditCard size={20} />
            )}
            {loading ? 'Processing...' : `Tap ${isPayment ? '& Pay' : 'for Attendance'}`}
          </Button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handlePinSubmit(); }}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter PIN to confirm payment</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="4-6 digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoFocus
              className="text-center text-lg font-mono tracking-widest"
            />
            <p className="text-xs text-muted-foreground text-center">
              Amount: GHS {parseFloat(amount).toFixed(2)}
            </p>
          </div>

          <Button type="submit" className="w-full h-14 text-lg gap-3" disabled={loading || pin.length < 4}>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <KeyRound size={20} />
            )}
            {loading ? 'Verifying...' : 'Confirm PIN'}
          </Button>
            </form>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 text-center ${result.ok ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}
              >
                <div className="flex justify-center mb-1">
                  {result.ok ? <Check size={24} /> : <X size={24} />}
                </div>
                <p className="font-semibold">{result.message}</p>
                {result.balance !== undefined && <p className="text-sm">Balance: GHS {result.balance.toFixed(2)}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-2">
            {services.filter((s) => s.id !== service).slice(0, 3).map((s) => (
              <button key={s.id} onClick={() => { setService(s.id); setResult(null); }}
                className="flex flex-col items-center gap-1 rounded-xl p-3 bg-muted hover:bg-muted/80 transition-colors text-xs"
              >
                <s.icon size={18} className="text-muted-foreground" />
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
