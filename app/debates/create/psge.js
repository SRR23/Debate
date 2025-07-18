import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import DebateForm from '../../../components/DebateForm';
import { redirect } from 'next/navigation';

export default async function CreateDebate() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create a New Debate</h1>
      <DebateForm />
    </div>
  );
}