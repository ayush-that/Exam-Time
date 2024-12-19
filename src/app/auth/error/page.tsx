'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-destructive">Authentication Error</CardTitle>
          <CardDescription>
            {error === 'AccessDenied'
              ? 'You do not have permission to sign in.'
              : error === 'Configuration'
              ? 'There is a problem with the server configuration.'
              : 'An error occurred while trying to authenticate.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild>
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 