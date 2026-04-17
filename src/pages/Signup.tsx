import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, RefreshCcw, ShieldCheck } from 'lucide-react';

import AuthLayout from '../components/AuthLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../lib/api';
import { DEFAULT_PHONE_COUNTRY_CODE, getInvalidPhoneMessage, normalizePhoneNumber } from '../lib/phone';
import {
  clearPendingSignupChallenge,
  loadPendingSignupChallenge,
  savePendingSignupChallenge,
  type SignupChallenge,
} from '../lib/pendingSignup';
import PhoneInputField from '../components/PhoneInputField';

const schema = z
  .object({
    country: z.enum(['LK']),
    fullName: z.string().min(2, 'Full name is required'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Use uppercase, lowercase, and a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine((values, ctx) => {
    if (!normalizePhoneNumber(values.mobileNumber, values.country)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mobileNumber'],
        message: getInvalidPhoneMessage(values.country),
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, signup, verifySignupOtp, resendSignupOtp } = useAuth();
  const [pendingChallenge, setPendingChallenge] = useState<SignupChallenge | null>(() => loadPendingSignupChallenge());
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!pendingChallenge) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [pendingChallenge]);

  useEffect(() => {
    if (!isAuthenticated) return;
    clearPendingSignupChallenge();
    navigate('/company/new', { replace: true });
  }, [isAuthenticated, navigate]);

  const resendRemainingMs = useMemo(() => {
    if (!pendingChallenge) return 0;
    return Math.max(0, new Date(pendingChallenge.resendAvailableAt).getTime() - now);
  }, [pendingChallenge, now]);

  const otpExpired = useMemo(() => {
    if (!pendingChallenge) return false;
    return new Date(pendingChallenge.expiresAt).getTime() <= now;
  }, [pendingChallenge, now]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      country: DEFAULT_PHONE_COUNTRY_CODE,
      fullName: '',
      mobileNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const normalizedMobileNumber = normalizePhoneNumber(values.mobileNumber, values.country);
    if (!normalizedMobileNumber) {
      form.setError('mobileNumber', { message: getInvalidPhoneMessage(values.country) });
      return;
    }

    try {
      const challenge = await signup({
        fullName: values.fullName,
        mobileNumber: normalizedMobileNumber,
        email: values.email ? values.email : undefined,
        password: values.password,
      });
      savePendingSignupChallenge(challenge);
      setPendingChallenge(challenge);
      setOtp('');
      toast({ title: 'OTP sent', description: 'Enter the 6-digit code sent to your mobile number.' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Signup failed';
      toast({ title: 'Signup failed', description: message, variant: 'destructive' });
    }
  };

  const handleVerifyOtp = async () => {
    if (!pendingChallenge) return;
    if (!/^\d{6}$/.test(otp)) {
      toast({ title: 'Invalid OTP', description: 'Enter the 6-digit code from the SMS.', variant: 'destructive' });
      return;
    }

    setIsVerifying(true);
    try {
      await verifySignupOtp({ challengeId: pendingChallenge.challengeId, otp });
      clearPendingSignupChallenge();
      setPendingChallenge(null);
      setOtp('');
      toast({ title: 'Account verified', description: 'Your mobile number has been verified.' });
      navigate('/company/new', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'OTP verification failed';
      toast({ title: 'Verification failed', description: message, variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingChallenge) return;

    setIsResending(true);
    try {
      const challenge = await resendSignupOtp(pendingChallenge.challengeId);
      savePendingSignupChallenge(challenge);
      setPendingChallenge(challenge);
      setOtp('');
      toast({ title: 'OTP resent', description: 'A new verification code has been sent.' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to resend OTP';
      toast({ title: 'Resend failed', description: message, variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  const resetFlow = () => {
    clearPendingSignupChallenge();
    setPendingChallenge(null);
    setOtp('');
  };

  const formatRemaining = (milliseconds: number) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    return totalSeconds > 0 ? `${totalSeconds}s` : '0s';
  };

  return (
    <AuthLayout>
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900">
            {pendingChallenge ? 'Verify mobile number' : 'Create account'}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {pendingChallenge
              ? 'Stay on this screen and enter the OTP to finish creating your account.'
              : 'Owner account for managing buses and trips.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingChallenge ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">OTP sent to {pendingChallenge.maskedMobile}</p>
                    <p>Enter the 6-digit code to activate your account. Until this is verified, sign-in and other operations stay blocked.</p>
                    {otpExpired ? (
                      <p className="text-amber-700">This OTP has expired. Request a new code to continue.</p>
                    ) : (
                      <p className="text-slate-500">Code expires at {new Date(pendingChallenge.expiresAt).toLocaleTimeString()}.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Verification code</label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  pattern={/^\d+$/}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 first:border last:border" />
                    <InputOTPSlot index={1} className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 first:border last:border" />
                    <InputOTPSlot index={2} className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 first:border last:border" />
                    <InputOTPSlot index={3} className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 first:border last:border" />
                    <InputOTPSlot index={4} className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 first:border last:border" />
                    <InputOTPSlot index={5} className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-base text-slate-900 first:border last:border" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="button"
                className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isVerifying || otp.length !== 6}
                onClick={handleVerifyOtp}
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 border-slate-300"
                  disabled={isResending || resendRemainingMs > 0}
                  onClick={handleResendOtp}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {isResending ? 'Sending...' : resendRemainingMs > 0 ? `Resend in ${formatRemaining(resendRemainingMs)}` : 'Resend OTP'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-11"
                  onClick={resetFlow}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Edit details
                </Button>
              </div>
            </div>
          ) : (
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
          )}

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