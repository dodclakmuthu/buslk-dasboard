import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { DEFAULT_PHONE_COUNTRY_CODE, getInvalidPhoneMessage, normalizePhoneNumber } from '../lib/phone';
import { getSignupChallengeFromErrorPayload, savePendingSignupChallenge } from '../lib/pendingSignup';
import PhoneInputField from '../components/PhoneInputField';

const schema = z.object({
  country: z.enum(['LK']),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  password: z.string().min(1, 'Password is required'),
}).superRefine((values, ctx) => {
  if (!normalizePhoneNumber(values.mobileNumber, values.country)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['mobileNumber'],
      message: getInvalidPhoneMessage(values.country),
    });
  }
});

type FormValues = z.infer<typeof schema>;

type LocationState = {
  from?: { pathname?: string };
};

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { country: DEFAULT_PHONE_COUNTRY_CODE, mobileNumber: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const normalizedMobileNumber = normalizePhoneNumber(values.mobileNumber, values.country);
    if (!normalizedMobileNumber) {
      form.setError('mobileNumber', { message: getInvalidPhoneMessage(values.country) });
      return;
    }

    try {
      await login({ mobileNumber: normalizedMobileNumber, password: values.password });
      const state = location.state as LocationState | null;
      const next = state?.from?.pathname && state.from.pathname !== '/login' ? state.from.pathname : '/';
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const challenge = getSignupChallengeFromErrorPayload(err.data);
        if (challenge) {
          savePendingSignupChallenge(challenge);
          toast({ title: 'Verify your mobile number', description: 'Enter the OTP sent to your phone to finish account setup.' });
          navigate('/signup', { replace: true });
          return;
        }
      }

      const message = err instanceof ApiError ? err.message : 'Login failed';
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <AuthLayout>
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
          <CardDescription className="text-slate-500">
            Sign in with your mobile number and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Mobile number</FormLabel>
                    <PhoneInputField
                      countryValue={form.watch('country')}
                      onCountryChange={(code) => {
                        form.setValue('country', code);
                        void form.trigger('mobileNumber');
                      }}
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                      hasError={!!fieldState.error}
                    />
                    <FormMessage />
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
                      <Input
                        type="password"
                        autoComplete="current-password"
                        className="h-11 border-slate-300 focus-visible:ring-blue-500"
                        {...field}
                      />
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
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}