'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Book, Plus, ArrowLeftRight, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/stores/locale';

interface BookType {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  shelfLocation: string;
  publisher?: string;
}

interface LoanType {
  id: string;
  book: { title: string };
  borrowedBy: string;
  borrowedType: string;
  borrowedDate: string;
  dueDate: string;
  status: string;
  fine?: number;
}

export default function LibraryPage() {
  const { t } = useI18n();
  const [books, setBooks] = useState<BookType[]>([]);
  const [loans, setLoans] = useState<LoanType[]>([]);
  const [activeTab, setActiveTab] = useState('books');

  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', publisher: '', category: '', quantity: '', shelfLocation: '' });
  const [bookSubmitting, setBookSubmitting] = useState(false);

  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanForm, setLoanForm] = useState({ bookId: '', borrowedBy: '', borrowedType: '', dueDate: '' });
  const [loanSubmitting, setLoanSubmitting] = useState(false);

  const [returnFine, setReturnFine] = useState<Record<string, string>>({});
  const [returning, setReturning] = useState<Record<string, boolean>>({});

  const fetchBooks = async () => {
    try {
      const data = await api.get<BookType[]>('/library/books');
      setBooks(data);
    } catch { setBooks([]); }
  };

  const fetchLoans = async () => {
    try {
      const data = await api.get<LoanType[]>('/library/loans');
      setLoans(data);
    } catch { setLoans([]); }
  };

  useEffect(() => { fetchBooks(); }, []);
  useEffect(() => { if (activeTab === 'loans') fetchLoans(); }, [activeTab]);

  const resetBookForm = () => {
    setBookForm({ title: '', author: '', isbn: '', publisher: '', category: '', quantity: '', shelfLocation: '' });
    setEditingBook(null);
    setShowBookForm(false);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookSubmitting(true);
    try {
      const body = { ...bookForm, quantity: Number(bookForm.quantity) };
      if (editingBook) {
        await api.put(`/library/books/${editingBook.id}`, body);
      } else {
        await api.post('/library/books', body);
      }
      resetBookForm();
      fetchBooks();
    } catch {}
    setBookSubmitting(false);
  };

  const handleEditBook = (book: BookType) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher || '',
      category: book.category,
      quantity: String(book.quantity),
      shelfLocation: book.shelfLocation,
    });
    setShowBookForm(true);
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await api.delete(`/library/books/${id}`);
      fetchBooks();
    } catch {}
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoanSubmitting(true);
    try {
      await api.post('/library/loans', { ...loanForm, bookId: Number(loanForm.bookId) });
      setShowLoanForm(false);
      setLoanForm({ bookId: '', borrowedBy: '', borrowedType: '', dueDate: '' });
      fetchLoans();
    } catch {}
    setLoanSubmitting(false);
  };

  const handleReturn = async (id: string) => {
    setReturning((p) => ({ ...p, [id]: true }));
    try {
      const fine = returnFine[id] ? Number(returnFine[id]) : undefined;
      await api.post(`/library/loans/${id}/return`, fine !== undefined ? { fine } : {});
      setReturnFine((p) => { const c = { ...p }; delete c[id]; return c; });
      fetchLoans();
    } catch {}
    setReturning((p) => ({ ...p, [id]: false }));
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600' },
      returned: { label: 'Returned', className: 'bg-slate-500/10 text-slate-600' },
      overdue: { label: 'Overdue', className: 'bg-red-500/10 text-red-600' },
    };
    const c = config[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="secondary" className={c.className}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-500/10 via-primary/10 to-sky-500/10 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">{t('pages.library')}</h1>
          <p className="text-muted-foreground">Manage books and track loans.</p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="books" className="flex items-center gap-2"><Book size={14} /> Books</TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-2"><ArrowLeftRight size={14} /> Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20" onClick={() => { resetBookForm(); setShowBookForm(!showBookForm); }}>
              <Plus size={16} className="mr-2" /> {t('common.add')}
            </Button>
          </div>

          {showBookForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Card className="border-border/50 shadow-sm">
                <CardHeader><CardTitle className="text-base font-medium">{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleBookSubmit} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="author">Author</Label>
                      <Input id="author" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input id="isbn" value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="publisher">Publisher</Label>
                      <Input id="publisher" value={bookForm.publisher} onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" min="1" value={bookForm.quantity} onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="shelfLocation">Shelf Location</Label>
                      <Input id="shelfLocation" value={bookForm.shelfLocation} onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })} required />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => { resetBookForm(); setShowBookForm(false); }}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={bookSubmitting}>{bookSubmitting ? t('common.saving') : editingBook ? 'Update Book' : t('common.add')}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left p-3 font-medium">Title</th>
                      <th className="text-left p-3 font-medium">Author</th>
                      <th className="text-left p-3 font-medium">ISBN</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-center p-3 font-medium">Available</th>
                      <th className="text-left p-3 font-medium">Shelf</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id} className="border-b border-border/50 last:border-0">
                        <td className="p-3 font-medium">{book.title}</td>
                        <td className="p-3 text-muted-foreground">{book.author}</td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{book.isbn}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs">{book.category}</Badge></td>
                        <td className="p-3 text-center">{book.quantity}</td>
                        <td className="p-3 text-center">
                          <span className={book.availableQuantity > 0 ? 'text-emerald-600' : 'text-red-600'}>{book.availableQuantity}</span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{book.shelfLocation}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEditBook(book)}>Edit</Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteBook(book.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {books.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Book size={32} className="text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No books found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md shadow-primary/20" onClick={() => setShowLoanForm(!showLoanForm)}>
              <Plus size={16} className="mr-2" /> Issue Book
            </Button>
          </div>

          {showLoanForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Card className="border-border/50 shadow-sm">
                <CardHeader><CardTitle className="text-base font-medium">Issue Book</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleLoanSubmit} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bookId">Book</Label>
                      <Select value={loanForm.bookId} onValueChange={(v) => setLoanForm({ ...loanForm, bookId: v ?? '' })}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select a book" /></SelectTrigger>
                        <SelectContent>
                          {books.filter((b) => b.availableQuantity > 0).map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.title} ({b.availableQuantity} available)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="borrowedBy">Borrowed By</Label>
                      <Input id="borrowedBy" value={loanForm.borrowedBy} onChange={(e) => setLoanForm({ ...loanForm, borrowedBy: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="borrowedType">Borrower Type</Label>
                      <Select value={loanForm.borrowedType} onValueChange={(v) => setLoanForm({ ...loanForm, borrowedType: v ?? '' })}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" type="date" value={loanForm.dueDate} onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })} required />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => { setShowLoanForm(false); setLoanForm({ bookId: '', borrowedBy: '', borrowedType: '', dueDate: '' }); }}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={loanSubmitting}>{loanSubmitting ? 'Issuing...' : 'Issue Book'}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left p-3 font-medium">Book</th>
                      <th className="text-left p-3 font-medium">Borrowed By</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Borrowed Date</th>
                      <th className="text-left p-3 font-medium">Due Date</th>
                      <th className="text-center p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Fine</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id} className="border-b border-border/50 last:border-0">
                        <td className="p-3 font-medium">{loan.book.title}</td>
                        <td className="p-3 text-muted-foreground">{loan.borrowedBy}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs capitalize">{loan.borrowedType}</Badge></td>
                        <td className="p-3 text-muted-foreground text-xs">{new Date(loan.borrowedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="p-3 text-xs">{new Date(loan.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="p-3 text-center">{statusBadge(loan.status)}</td>
                        <td className="p-3 text-right text-sm">{loan.fine != null ? `$${loan.fine}` : '-'}</td>
                        <td className="p-3 text-right">
                          {loan.status === 'active' || loan.status === 'overdue' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                placeholder="Fine $"
                                className="w-20 h-8 text-xs"
                                value={returnFine[loan.id] || ''}
                                onChange={(e) => setReturnFine((p) => ({ ...p, [loan.id]: e.target.value }))}
                              />
                              <Button size="sm" variant="outline" className="text-emerald-600" disabled={returning[loan.id]} onClick={() => handleReturn(loan.id)}>
                                <CheckCircle size={12} className="mr-1" /> Return
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ArrowLeftRight size={32} className="text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No loans found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
