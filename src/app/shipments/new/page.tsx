'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWalletStore } from '@/store/wallet';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MilestoneInput {
  description: string;
  locationName: string;
  expectedAt: string;
  amountStroops: string;
}

const defaultMilestone = (): MilestoneInput => ({
  description: '',
  locationName: '',
  expectedAt: '',
  amountStroops: '',
});

type Step = 1 | 2 | 3;

export default function NewShipmentPage() {
  const router = useRouter();
  const { isConnected } = useWalletStore();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isConnected) router.push('/');
  }, [isConnected, router]);

  // Form state
  const [form, setForm] = useState({
    receiverAddress: '',
    carrierAddress: '',
    origin: '',
    destination: '',
    estimatedDelivery: '',
    cargo: {
      description: '',
      weightG: '',
      volumeCm3: '',
      isHazmat: false,
      isTempControlled: false,
      declaredValueUsd: '',
    },
    milestones: [defaultMilestone(), defaultMilestone()],
    totalAmountStroops: '',
  });

  const { mutate: createShipment, isPending } = useMutation({
    mutationFn: () =>
      api.shipments.create({
        receiverAddress: form.receiverAddress,
        carrierAddress: form.carrierAddress,
        origin: form.origin,
        destination: form.destination,
        estimatedDelivery: form.estimatedDelivery || undefined,
        cargo: {
          description: form.cargo.description,
          weightG: parseInt(form.cargo.weightG, 10) || 0,
          volumeCm3: parseInt(form.cargo.volumeCm3, 10) || 0,
          isHazmat: form.cargo.isHazmat,
          isTempControlled: form.cargo.isTempControlled,
          declaredValueUsd: form.cargo.declaredValueUsd
            ? parseFloat(form.cargo.declaredValueUsd)
            : undefined,
        },
        milestones: form.milestones
          .filter((m) => m.description.trim())
          .map((m) => ({
            description: m.description,
            locationName: m.locationName,
            expectedAt: m.expectedAt || undefined,
            amountStroops: m.amountStroops ? parseInt(m.amountStroops, 10) : undefined,
          })),
        totalAmountStroops: form.totalAmountStroops
          ? parseInt(form.totalAmountStroops, 10)
          : undefined,
      }),
    onSuccess: (shipment) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      router.push(`/shipments/${shipment.id}`);
    },
  });

  const updateCargo = (key: string, value: string | boolean) => {
    setForm((f) => ({ ...f, cargo: { ...f.cargo, [key]: value } }));
  };

  const updateMilestone = (i: number, key: string, value: string) => {
    setForm((f) => {
      const milestones = [...f.milestones];
      milestones[i] = { ...milestones[i], [key]: value };
      return { ...f, milestones };
    });
  };

  const addMilestone = () => {
    if (form.milestones.length >= 20) return;
    setForm((f) => ({ ...f, milestones: [...f.milestones, defaultMilestone()] }));
  };

  const removeMilestone = (i: number) => {
    setForm((f) => ({
      ...f,
      milestones: f.milestones.filter((_, idx) => idx !== i),
    }));
  };

  const validateStep = (s: Step): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.receiverAddress || form.receiverAddress.length !== 56)
        errs.receiverAddress = 'Enter a valid Stellar address (56 chars)';
      if (!form.carrierAddress || form.carrierAddress.length !== 56)
        errs.carrierAddress = 'Enter a valid Stellar address (56 chars)';
      if (!form.origin.trim()) errs.origin = 'Origin is required';
      if (!form.destination.trim()) errs.destination = 'Destination is required';
    }
    if (s === 2) {
      if (!form.cargo.description.trim()) errs.cargoDescription = 'Description required';
      if (!form.cargo.weightG || isNaN(Number(form.cargo.weightG)))
        errs.weightG = 'Valid weight required';
    }
    if (s === 3) {
      if (form.milestones.filter((m) => m.description.trim()).length === 0)
        errs.milestones = 'At least one milestone required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => (s + 1) as Step);
  };

  const fieldCls = (err?: string) =>
    cn(
      'w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors',
      err ? 'border-destructive focus:ring-destructive/50' : 'border-border',
    );

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <button
          onClick={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">New Shipment</h1>
        <p className="text-muted-foreground mt-0.5">
          Create an on-chain trackable shipment with milestone-based payments.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : step > s
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {s}
            </div>
            <span
              className={cn(
                'text-xs font-medium hidden sm:block',
                step >= s ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {s === 1 ? 'Parties & Route' : s === 2 ? 'Cargo Details' : 'Milestones'}
            </span>
            {s < 3 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {/* Step 1: Parties & Route */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-base mb-4">Parties & Route</h2>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Receiver Stellar Address
              </label>
              <input
                type="text"
                placeholder="G..."
                value={form.receiverAddress}
                onChange={(e) => setForm((f) => ({ ...f, receiverAddress: e.target.value }))}
                className={fieldCls(errors.receiverAddress)}
              />
              {errors.receiverAddress && (
                <p className="mt-1 text-xs text-destructive">{errors.receiverAddress}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Carrier Stellar Address
              </label>
              <input
                type="text"
                placeholder="G..."
                value={form.carrierAddress}
                onChange={(e) => setForm((f) => ({ ...f, carrierAddress: e.target.value }))}
                className={fieldCls(errors.carrierAddress)}
              />
              {errors.carrierAddress && (
                <p className="mt-1 text-xs text-destructive">{errors.carrierAddress}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Origin</label>
                <input
                  type="text"
                  placeholder="Lagos, Nigeria"
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  className={fieldCls(errors.origin)}
                />
                {errors.origin && (
                  <p className="mt-1 text-xs text-destructive">{errors.origin}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Destination</label>
                <input
                  type="text"
                  placeholder="Nairobi, Kenya"
                  value={form.destination}
                  onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  className={fieldCls(errors.destination)}
                />
                {errors.destination && (
                  <p className="mt-1 text-xs text-destructive">{errors.destination}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Estimated Delivery <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={form.estimatedDelivery}
                onChange={(e) => setForm((f) => ({ ...f, estimatedDelivery: e.target.value }))}
                className={fieldCls()}
              />
            </div>
          </div>
        )}

        {/* Step 2: Cargo Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-base mb-4">Cargo Details</h2>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Cargo Description</label>
              <textarea
                rows={2}
                placeholder="Electronics — 50 units Samsung Galaxy S25"
                value={form.cargo.description}
                onChange={(e) => updateCargo('description', e.target.value)}
                className={fieldCls(errors.cargoDescription)}
              />
              {errors.cargoDescription && (
                <p className="mt-1 text-xs text-destructive">{errors.cargoDescription}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight (grams)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="25000"
                  value={form.cargo.weightG}
                  onChange={(e) => updateCargo('weightG', e.target.value)}
                  className={fieldCls(errors.weightG)}
                />
                {errors.weightG && (
                  <p className="mt-1 text-xs text-destructive">{errors.weightG}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Volume (cm³)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="50000"
                  value={form.cargo.volumeCm3}
                  onChange={(e) => updateCargo('volumeCm3', e.target.value)}
                  className={fieldCls()}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Declared Value (USD) <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="5000.00"
                value={form.cargo.declaredValueUsd}
                onChange={(e) => updateCargo('declaredValueUsd', e.target.value)}
                className={fieldCls()}
              />
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.cargo.isHazmat}
                  onChange={(e) => updateCargo('isHazmat', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Hazardous Materials (HAZMAT)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.cargo.isTempControlled}
                  onChange={(e) => updateCargo('isTempControlled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Temperature Controlled</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Total Escrow Amount (stroops){' '}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="100000000 = 10 XLM"
                value={form.totalAmountStroops}
                onChange={(e) => setForm((f) => ({ ...f, totalAmountStroops: e.target.value }))}
                className={fieldCls()}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                1 XLM = 10,000,000 stroops. Leave blank to skip payment escrow.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Milestones */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-base">Milestones</h2>
              <button
                onClick={addMilestone}
                disabled={form.milestones.length >= 20}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Milestone
              </button>
            </div>

            {errors.milestones && (
              <p className="text-xs text-destructive">{errors.milestones}</p>
            )}

            {form.milestones.map((m, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Milestone {i + 1}
                  </span>
                  {form.milestones.length > 1 && (
                    <button
                      onClick={() => removeMilestone(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Description (e.g. Pickup from warehouse)"
                    value={m.description}
                    onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                    className={fieldCls()}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Location name"
                    value={m.locationName}
                    onChange={(e) => updateMilestone(i, 'locationName', e.target.value)}
                    className={fieldCls()}
                  />
                  <input
                    type="datetime-local"
                    value={m.expectedAt}
                    onChange={(e) => updateMilestone(i, 'expectedAt', e.target.value)}
                    className={fieldCls()}
                  />
                </div>
                {form.totalAmountStroops && (
                  <input
                    type="number"
                    placeholder="Payment amount (stroops)"
                    value={m.amountStroops}
                    onChange={(e) => updateMilestone(i, 'amountStroops', e.target.value)}
                    className={fieldCls()}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <Package className="inline h-3.5 w-3.5 mr-1" />
          This shipment will be recorded on Stellar Testnet.
        </div>
        <div className="flex gap-3">
          {step < 3 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => validateStep(3) && createShipment()}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isPending ? 'Creating…' : 'Create Shipment'}
              {!isPending && <ArrowRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
