import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error = (searchParams.error as string) ?? '';
  const next = (searchParams.next as string) ?? '';
  return <LoginForm initialError={error} nextPath={next} />;
}
