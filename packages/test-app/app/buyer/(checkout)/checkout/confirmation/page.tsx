import { CheckoutConfirmation } from "@/components/checkout/checkout-confirmation";
import { checkSimulateError } from "@/lib/api/_simulate";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ simulate?: string; [k: string]: unknown }>;
}) {
  const sp = await searchParams;
  checkSimulateError(sp);

  return <CheckoutConfirmation />;
}
