import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import AuthLayout from '../components/AuthLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../lib/api';

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    mobileNumber: z.string().min(9, 'Mobile number is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', mobileNumber: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await signup({
        fullName: values.fullName,
        mobileNumber: values.mobileNumber,
        email: values.email ? values.email : undefined,
        password: values.password,
      });
      toast({ title: 'Account created', description: 'You can now sign in.' });
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Signup failed';
      toast({ title: 'Signup failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <AuthLayout>
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900">Create account</CardTitle>
          <CardDescription className="text-slate-500">
            Owner account for managing buses and trips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Full name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" className="h-11 border-slate-300 focus-visible:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Mobile number</FormLabel>
                    <FormControl>
                      <Input placeholder="07XXXXXXXX" autoComplete="tel" className="h-11 border-slate-300 focus-visible:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      Email <span className="text-slate-400 font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" className="h-11 border-slate-300 focus-visible:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" className="h-11 border-slate-300 focus-visible:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" className="h-11 border-slate-300 focus-visible:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create account'}
              </Button>
            </form>
          </Form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}