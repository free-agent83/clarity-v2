"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@nivoda/components";
import { Input } from "@nivoda/components";
import { Label } from "@nivoda/components";
import { Separator } from "@nivoda/components";
import { Switch } from "@nivoda/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nivoda/components";

function SettingsCard({
  title,
  description,
  onSave,
  children,
}: {
  title: string;
  description?: string;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <div className="flex flex-col gap-5">{children}</div>
      <div className="flex justify-end">
        <Button onClick={onSave}>Save changes</Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-center gap-6">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div>{children}</div>
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function saved() {
  toast.success("Settings saved");
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "Sarah Mitchell",
    email: "sarah.mitchell@gemhousejewels.com",
    phone: "+1 212 555 0147",
    country: "us",
  });

  const [company, setCompany] = useState({
    companyName: "Gem House Jewels",
    businessType: "retail",
    website: "gemhousejewels.com",
    vatNumber: "US-47291830",
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newArrivals: false,
    priceAlerts: true,
    weeklyDigest: false,
  });

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  return (
    <div className="flex flex-col gap-8 pb-32">
      <h1 className="text-5xl font-medium leading-14 text-foreground">
        Settings
      </h1>

      <SettingsCard
        title="Profile information"
        description="Your name and contact details."
        onSave={saved}
      >
        <Field label="Full name">
          <Input
            value={profile.fullName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, fullName: e.target.value }))
            }
          />
        </Field>
        <Field label="Email address">
          <Input
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
          />
        </Field>
        <Field label="Phone">
          <Input
            type="tel"
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({ ...p, phone: e.target.value }))
            }
          />
        </Field>
        <Field label="Country">
          <Select
            value={profile.country}
            onValueChange={(v) => setProfile((p) => ({ ...p, country: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="gb">United Kingdom</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="in">India</SelectItem>
              <SelectItem value="ae">United Arab Emirates</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </SettingsCard>

      <SettingsCard
        title="Company details"
        description="Information about your business."
        onSave={saved}
      >
        <Field label="Company name">
          <Input
            value={company.companyName}
            onChange={(e) =>
              setCompany((c) => ({ ...c, companyName: e.target.value }))
            }
          />
        </Field>
        <Field label="Business type">
          <Select
            value={company.businessType}
            onValueChange={(v) =>
              setCompany((c) => ({ ...c, businessType: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail Jeweller</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="estate">Estate &amp; Antique</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Website">
          <Input
            value={company.website}
            onChange={(e) =>
              setCompany((c) => ({ ...c, website: e.target.value }))
            }
          />
        </Field>
        <Field label="VAT / Tax ID">
          <Input
            value={company.vatNumber}
            onChange={(e) =>
              setCompany((c) => ({ ...c, vatNumber: e.target.value }))
            }
          />
        </Field>
      </SettingsCard>

      <SettingsCard
        title="Notification preferences"
        description="Choose what you hear about from us."
        onSave={saved}
      >
        <SwitchRow
          label="Order updates"
          description="Confirmations, shipping notifications, and delivery alerts."
          checked={notifications.orderUpdates}
          onCheckedChange={(v) =>
            setNotifications((n) => ({ ...n, orderUpdates: v }))
          }
        />
        <Separator />
        <SwitchRow
          label="New arrivals & deals"
          description="Be the first to know about new stock and promotions."
          checked={notifications.newArrivals}
          onCheckedChange={(v) =>
            setNotifications((n) => ({ ...n, newArrivals: v }))
          }
        />
        <Separator />
        <SwitchRow
          label="Price drop alerts"
          description="Get notified when items on your shortlist drop in price."
          checked={notifications.priceAlerts}
          onCheckedChange={(v) =>
            setNotifications((n) => ({ ...n, priceAlerts: v }))
          }
        />
        <Separator />
        <SwitchRow
          label="Weekly digest"
          description="A summary of your activity and recommendations, every Monday."
          checked={notifications.weeklyDigest}
          onCheckedChange={(v) =>
            setNotifications((n) => ({ ...n, weeklyDigest: v }))
          }
        />
      </SettingsCard>

      <SettingsCard
        title="Password"
        description="Update your password to keep your account secure."
        onSave={saved}
      >
        <Field label="Current password">
          <Input
            type="password"
            placeholder="••••••••"
            value={password.current}
            onChange={(e) =>
              setPassword((p) => ({ ...p, current: e.target.value }))
            }
          />
        </Field>
        <Field label="New password">
          <Input
            type="password"
            placeholder="••••••••"
            value={password.next}
            onChange={(e) =>
              setPassword((p) => ({ ...p, next: e.target.value }))
            }
          />
        </Field>
        <Field label="Confirm new password">
          <Input
            type="password"
            placeholder="••••••••"
            value={password.confirm}
            onChange={(e) =>
              setPassword((p) => ({ ...p, confirm: e.target.value }))
            }
          />
        </Field>
      </SettingsCard>
    </div>
  );
}
