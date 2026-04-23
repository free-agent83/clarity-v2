import { notFound } from "next/navigation";
import { PlpGridContainer, Separator } from "@nivoda/components";
import { PdpDelivery } from "@nivoda/components/components/templates/pdp/pdp-delivery";
import { PdpHeading } from "@nivoda/components/components/templates/pdp/pdp-heading";
import { PdpLayout } from "@nivoda/components/components/templates/pdp/pdp-layout";
import { PdpPrice } from "@nivoda/components/components/templates/pdp/pdp-price";
import { PdpPrimaryAction } from "@nivoda/components/components/templates/pdp/pdp-primary-action";
import { PdpReturns } from "@nivoda/components/components/templates/pdp/pdp-returns";
import { PdpSpecifications } from "@nivoda/components/components/templates/pdp/pdp-specifications";
import type {
  PdpSpecificationRow,
  ProductMedia,
} from "@nivoda/components/components/templates/pdp/pdp-types";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { DiamondPlpItem } from "@/components/products/diamond-plp-item";
import { PdpBreadcrumbs } from "@/components/products/pdp-breadcrumbs";
import { PdpMediaWithLightbox } from "@/components/products/pdp-media-with-lightbox";
import {
  getMockStockId,
  getPlpItemMock,
} from "@/components/products/plp-item-mocks";
import { ProductActions } from "@/components/product-actions";
import { DiamondCertificateInfo } from "@/components/layouts/layout-product-detail/diamond-certificate-info";

import { fetchDiamondItem, fetchRelatedDiamonds } from "@/lib/api/diamonds";

type Props = { params: Promise<{ slug: string }> };

export default async function LabGrownDiamondDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, relatedRaw] = await Promise.all([
    fetchDiamondItem(slug, true),
    fetchRelatedDiamonds(slug, true),
  ]);
  if (!item) notFound();

  const mockStockId = getMockStockId(item.id);
  const mock = getPlpItemMock(item.id);

  const breadcrumbs = [
    { label: "Lab grown diamonds", href: "/buyer/browse/lab-grown-diamonds" },
    {
      label: item.description,
      href: `/buyer/browse/lab-grown-diamonds/${item.id}`,
    },
  ];

  const media: ProductMedia[] = [item.images.main, ...item.images.additional]
    .filter((src) => src && src.length > 0)
    .map((src) => ({ type: "image", src, alt: item.description }));

  const specs: PdpSpecificationRow[] = [
    { label: "Shape", value: item.shape },
    { label: "Carat", value: item.carat.toFixed(2) },
    { label: "Color", value: item.color },
    { label: "Clarity", value: item.clarity },
    { label: "Cut", value: item.cut },
    { label: "Polish", value: item.polish },
    { label: "Symmetry", value: item.symmetry },
    { label: "Fluorescence", value: item.fluorescence },
    { label: "Table %", value: `${item.tablePct}%` },
    { label: "Depth %", value: `${item.depthPct}%` },
    {
      label: "Dimensions",
      value: `${item.dimensions.length} × ${item.dimensions.width} × ${item.dimensions.depth} mm`,
    },
    {
      label: "Certificate",
      value: `${item.certification.lab} ${item.certification.number}`,
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-32">
      <PdpBreadcrumbs segments={breadcrumbs} />

      <PdpLayout
        stickyTop="24px"
        media={<PdpMediaWithLightbox media={media} />}
        body={
          <div className="flex flex-col gap-6">
            <PdpHeading name={item.description} sku={mockStockId} />
            <PdpPrice
              amount={item.price}
              currency="USD"
              label="Price"
              perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
            />
            <div className="flex flex-col gap-1">
              <PdpReturns
                {...(mock.isReturnable
                  ? {
                      variant: "returnable",
                      returnsWindow: "14 days",
                      policyLink: <a href="#">Returns Policy applies</a>,
                    }
                  : { variant: "non-returnable" })}
              />
              <PdpDelivery
                {...(mock.isExpress
                  ? { variant: "express", date: mock.deliveryDate }
                  : {
                      variant: "regular",
                      date: mock.deliveryDate,
                      shipsFrom: mock.shipsFrom,
                    })}
              />
            </div>
            <DiamondCertificateInfo
              lab={item.certification.lab}
              certificateNumber={item.certification.number}
              shape={item.shape}
              carat={item.carat}
              color={item.color}
              clarity={item.clarity}
              cut={item.cut}
            />
            <PdpPrimaryAction
              secondaryActions={
                <ProductActions
                  product={{
                    title: item.description,
                    subtitle: "Lab-grown diamond",
                    price: item.price,
                    imageSrc: item.images.main,
                    attributes: specs.map((s) => ({
                      label: s.label,
                      value: String(s.value),
                    })),
                  }}
                />
              }
            >
              <AddToCartButton
                product={{
                  productId: item.id,
                  name: item.description,
                  certLab: item.certification.lab,
                  certNumber: item.certification.number,
                  stockId: mockStockId,
                  price: item.price,
                  discount: null,
                  image: item.images.main,
                  category: "lab_grown_diamond",
                  quantity: 1,
                }}
              />
            </PdpPrimaryAction>
          </div>
        }
      >
        <Separator />
        <PdpSpecifications rows={specs} />
      </PdpLayout>

      {relatedRaw.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-foreground">
            You may also like
          </h2>
          <PlpGridContainer>
            {relatedRaw.map((related) => (
              <DiamondPlpItem
                key={related.id}
                href={`/buyer/browse/lab-grown-diamonds/${related.id}`}
                category="lab_grown_diamond"
                item={{
                  id: related.id,
                  stockId: related.stockId,
                  shape: related.shape,
                  carat: related.carat,
                  color: related.color,
                  clarity: related.clarity,
                  cut: related.cut,
                  price: related.price,
                  pricePerCarat: related.pricePerCarat,
                  image: related.images.main,
                  description: related.description,
                  certLab: related.certification.lab,
                  certNumber: related.certification.number,
                }}
              />
            ))}
          </PlpGridContainer>
        </div>
      )}
    </div>
  );
}
