import { LayoutUnderConstruction } from "@/components/layouts/layout-under-construction/layout-under-construction";

export default function CustomJewelleryPage() {
  return (
    <LayoutUnderConstruction
      title="Custom Jewellery"
      description="Bespoke creations are on the way. Soon you'll be able to design one-of-a-kind pieces right here."
      backHref="/buyer/browse/jewelry/engagement-rings"
      backLabel="Browse engagement rings"
    />
  );
}
