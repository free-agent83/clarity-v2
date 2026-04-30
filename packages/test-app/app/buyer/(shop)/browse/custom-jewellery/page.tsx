import { LayoutUnderConstruction } from "@/components/layouts/layout-under-construction/layout-under-construction";
import { checkSimulateError } from "@/lib/api/_simulate";

export default async function CustomJewelleryPage({
  searchParams,
}: {
  searchParams: Promise<{ simulate?: string; [k: string]: unknown }>;
}) {
  const sp = await searchParams;
  checkSimulateError(sp);

  return (
    <LayoutUnderConstruction
      title="Custom Jewellery"
      description="Bespoke creations are on the way. Soon you'll be able to design one-of-a-kind pieces right here."
      backHref="/buyer/browse/jewelry/engagement-rings"
      backLabel="Browse engagement rings"
    />
  );
}
