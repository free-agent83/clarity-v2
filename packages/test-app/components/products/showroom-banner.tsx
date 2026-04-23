import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Button, Typography } from "@nivoda/components";

export function ShowroomBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-linear-to-r from-slate-900 via-violet-950 to-slate-900 px-6 py-6">
      <div className="min-w-0">
        <Typography
          as="h2"
          variant="body-1"
          emphasis
          className="text-white"
        >
          Boost your sales. Get started with Showroom today.
        </Typography>
        <Typography
          variant="body-2"
          className="text-white/70"
        >
          Publish a branded storefront your customers can browse, sharing your
          selection with zero engineering lift.
        </Typography>
      </div>
      <Button asChild className="bg-violet-600 text-white hover:bg-violet-500">
        <Link href="#">
          Learn more
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
