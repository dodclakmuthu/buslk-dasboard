import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Building2 } from 'lucide-react';

import AuthLayout from '../components/AuthLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { createCompany } from '../lib/companyApi';
import { ApiError } from '../lib/api';

const schema = z.object({
  name: z.string().min(2, 'Company name is required'),
  businessType: z.string().optional(),
  mobileNumber: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

const BUSINESS_TYPES = [
  { value: 'individual_owner', label: 'Individual Owner' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'pvt_ltd', label: 'Private Limited Company' },
  { value: 'other', label: 'Other' },
];

export default function CreateCompany() {
  const { token } = useAuth();
  const { hasCompany, setCompany, refreshCompany } = useCompany();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user already has a company, redirect to dashboard immediately
  useEffect(() => {
    if (hasCompany) {
      navigate('/dashboard', { replace: true });
    }
  }, [hasCompany, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      businessType: 'individual_owner',
      mobileNumber: '',
      address: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) return;
    try {
      const res = await createCompany(token, {
        name: values.name,
        businessType: values.businessType || undefined,
        mobileNumber: values.mobileNumber || undefined,
        address: values.address || undefined,
      });
      setCompany(res.company);
      toast({
        title: 'Company created',
        description: `${res.company.name} is ready. Welcome to BusLK!`,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create company';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const inputCls = 'h-11 border-slate-300 focus-visible:ring-amber-500';

  return (
    <AuthLayout>
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                Set up your company
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-slate-500">
            Create your bus operations company to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      Company name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Perera Bus Services"
                        className={inputCls}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Business Type */}
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      Business type{' '}
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_TYPES.map((bt) => (
                          <SelectItem key={bt.value} value={bt.value}>
                            {bt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      Contact number{' '}
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="07XXXXXXXX"
                        autoComplete="tel"
                        className={inputCls}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">
                      Address{' '}
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 45/2, Kandy Road, Kadawatha"
                        className={inputCls}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating…' : 'Create company & continue'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
