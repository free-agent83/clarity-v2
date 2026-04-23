import { notFound } from "next/navigation";
import { IconInfoCircle, IconRefresh, IconTruck } from "@tabler/icons-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";

import { fetchDiamondItem, fetchRelatedDiamonds } from "@/lib/api/diamonds";
import { formatUSD } from "@/lib/utils";
import { LayoutProductDetail } from "@/components/layouts/layout-product-detail/layout-product-detail";
import type { SpecRow } from "@/components/layouts/types";
import type { ProductListItemProps } from "@/components/products/product-list-item";
import { DiamondCertificateInfo } from "@/components/layouts/layout-product-detail/diamond-certificate-info";
import { ProductActions } from "@/components/product-actions";

type Props = { params: Promise<{ slug: string }> };

export default async function LabGrownDiamondDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, relatedRaw] = await Promise.all([
    fetchDiamondItem(slug, true),
    fetchRelatedDiamonds(slug, true),
  ]);
  if (!item) notFound();

  const breadcrumbs = [
    { label: "Lab grown diamonds", href: "/buyer/browse/lab-grown-diamonds" },
    {
      label: item.description,
      href: `/buyer/browse/lab-grown-diamonds/${item.id}`,
    },
  ];

  const images = [item.images.main, ...item.images.additional]
    .filter((img) => img && img.length > 0)
    .map((src) => ({ src, alt: item.description }));

  const formattedPrice = formatUSD(item.price);

  const specs: SpecRow[] = [
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
  const relatedItems: ProductListItemProps[] = relatedRaw.map((related) => ({
    id: related.id,
    href: `/browse/lab-grown-diamonds/${related.id}`,
    imageSrc: related.images.main,
    imageAlt: related.description,
    title: related.description,
    subtitle: `${related.certification.lab} ${related.certification.number} · ${related.stockId}`,
    priceLabel: "Price",
    formattedPrice: formatUSD(related.price),
  }));

  return (
    <LayoutProductDetail
      breadcrumbs={breadcrumbs}
      images={images}
      title={item.description}
      priceLabel="Price"
      formattedPrice={formattedPrice}
      actions={
        <ProductActions
          product={{
            title: item.description,
            subtitle: "Lab-grown diamond",
            price: item.price,
            imageSrc: item.images.main,
            attributes: specs,
          }}
        />
      }
      configuration={
        <DiamondCertificateInfo
          lab={item.certification.lab}
          certificateNumber={item.certification.number}
          shape={item.shape}
          carat={item.carat}
          color={item.color}
          clarity={item.clarity}
          cut={item.cut}
        />
      }
      ctaButton={
        <AddToCartButton
          product={{
            productId: item.id,
            name: item.description,
            certLab: item.certification.lab,
            certNumber: item.certification.number,
            stockId: item.stockId,
            price: item.price,
            discount: null,
            image: item.images.main,
            category: "lab_grown_diamond",
            quantity: 1,
          }}
        />
      }
      shippingInfo={
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-3">
            <IconRefresh
              size={24}
              className="mt-0.5 shrink-0 text-foreground"
            />
            <div className="flex flex-wrap items-center gap-1 pt-0.5 text-sm">
              <span className="font-medium text-[#3d745c]">14-day returns</span>
              <span className="text-muted-foreground">
                · Returns Policy applies
              </span>
              <IconInfoCircle size={18} className="text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <IconTruck size={24} className="mt-0.5 shrink-0 text-foreground" />
            <div className="flex flex-wrap items-center gap-1 pt-0.5 text-sm">
              <span className="text-muted-foreground">
                Estimated delivery in
              </span>
              <span className="font-medium text-foreground">
                10 business days
              </span>
            </div>
          </div>
        </div>
      }
      specs={specs}
      relatedItems={relatedItems}
    />
  );
}
