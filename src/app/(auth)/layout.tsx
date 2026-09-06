import { StudentBackNav } from '@/components/layout/student-back-nav';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <StudentBackNav />
      {children}
    </div>
  );
}
