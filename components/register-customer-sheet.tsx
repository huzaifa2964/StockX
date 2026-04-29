"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAuth } from "@/app/providers";
import { getCurrentUser, supabase } from "@/lib/supabase";

interface FormErrors {
  [key: string]: string;
}

const cityAreas = [
  "City Center, Sheikhupura",
  "Bazaar Area, Sheikhupura",
  "Housing Colony (Satellite Town), Sheikhupura",
  "Factory Area, Sheikhupura",
  "Lahore Road, Sheikhupura",
  "Civil Lines, Sheikhupura",
  "Old City / Fort Area, Sheikhupura",
  "Near Jinnah Park, Sheikhupura",
  "Sargodha Road Aziz Bhatti Town, Sheikhupura",
  "Rehman Colony, Sheikhupura",
  "Industrial Zone, Sheikhupura",
  "Faisalabad Road, Sheikhupura",
  "Okara Road, Sheikhupura",
  "Canal Road, Sheikhupura",
];

export function RegisterCustomerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cityArea, setCityArea] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!contactPerson.trim()) {
      newErrors.contactPerson = "Contact person name is required";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!cityArea.trim()) {
      newErrors.cityArea = "City/Area is required";
    }

    if (!creditLimit.trim()) {
      newErrors.creditLimit = "Credit limit is required";
    } else if (isNaN(Number(creditLimit))) {
      newErrors.creditLimit = "Credit limit must be a valid number";
    }

    if (!paymentTerms.trim()) {
      newErrors.paymentTerms = "Payment terms are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setErrors({ submit: "Please sign in to register customers." });
          return;
        }

        const { data, error } = await supabase
          .from("customers")
          .insert([
            {
              created_by: user.id,
              business_name: businessName,
              contact_person: contactPerson,
              phone,
              email,
              city_area: cityArea,
              credit_limit: parseFloat(creditLimit),
              payment_terms: paymentTerms,
              status: "Good Standing",
              outstanding_balance: 0,
            },
          ])
          .select();

        if (error) {
          // Check if it's a table not found error
          if (error.message.includes("does not exist") || error.message.includes("products")) {
            setErrors({ 
              submit: "Database tables not created yet. Please run the migration SQL in Supabase. See DATABASE_SETUP.md for instructions." 
            });
          } else {
            setErrors({ submit: error.message });
          }
          return;
        }

        setSuccessMessage("✓ Customer registered successfully!");
        setTimeout(() => {
          onOpenChange(false);
          setBusinessName("");
          setContactPerson("");
          setPhone("");
          setEmail("");
          setCityArea("");
          setCreditLimit("");
          setPaymentTerms("");
          setSuccessMessage("");
          setErrors({});
        }, 1000);
      } catch (error: any) {
        setErrors({ submit: "Failed to register customer. Please try again." });
        console.error("Error:", error);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="inset-0 h-dvh w-auto max-w-none overflow-x-hidden rounded-none border-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-full sm:max-w-xl sm:border-l sm:border-slate-200"
      >
        <SheetHeader className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div>
            <SheetTitle>Register New Customer</SheetTitle>
            <SheetDescription>
              Add a new retail partner to the Al-Noor distribution network. Complete all details to establish the customer account.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Business Information
                </h3>
                <p className="mt-1 text-sm text-slate-500">Enter the retail store or distributor details.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="business-name">
                  Business Name
                </label>
                <Input
                  id="business-name"
                  placeholder="e.g., Al-Madina Super Store"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={errors.businessName ? "border-red-500" : ""}
                />
                {errors.businessName && (
                  <p className="text-xs text-red-600">{errors.businessName}</p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="contact-person">
                    Contact Person
                  </label>
                  <Input
                    id="contact-person"
                    placeholder="Name of store owner/manager"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className={errors.contactPerson ? "border-red-500" : ""}
                  />
                  {errors.contactPerson && (
                    <p className="text-xs text-red-600">{errors.contactPerson}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="city-area">
                    City / Area
                  </label>
                  <Select value={cityArea} onValueChange={setCityArea}>
                    <SelectTrigger className={errors.cityArea ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cityArea && (
                    <p className="text-xs text-red-600">{errors.cityArea}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Contact Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">Ensure phone and email are current for order updates.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="phone">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="email">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Credit Terms
                </h3>
                <p className="mt-1 text-sm text-slate-500">Set the credit limit and preferred payment arrangement.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="credit-limit">
                    Credit Limit (PKR)
                  </label>
                  <Input
                    id="credit-limit"
                    type="number"
                    placeholder="500000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className={errors.creditLimit ? "border-red-500" : ""}
                  />
                  {errors.creditLimit && (
                    <p className="text-xs text-red-600">{errors.creditLimit}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="payment-terms">
                    Payment Terms
                  </label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger className={errors.paymentTerms ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 7 Days">Net 7 Days</SelectItem>
                      <SelectItem value="Net 15 Days">Net 15 Days</SelectItem>
                      <SelectItem value="Net 30 Days">Net 30 Days</SelectItem>
                      <SelectItem value="Net 45 Days">Net 45 Days</SelectItem>
                      <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentTerms && (
                    <p className="text-xs text-red-600">{errors.paymentTerms}</p>
                  )}
                </div>
              </div>
            </section>
          </form>
        </div>

        <SheetFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="w-full text-sm text-slate-500 sm:w-auto">
            {errors.submit ? (
              <span className="text-red-600">{errors.submit}</span>
            ) : successMessage ? (
              <span className="text-emerald-600">{successMessage}</span>
            ) : (
              "Customer data will be securely stored in the system."
            )}
          </p>
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <SheetClose asChild>
              <Button variant="outline" className="w-full rounded-full px-5">
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={handleSubmit}
              className="w-full rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              Register Customer
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
