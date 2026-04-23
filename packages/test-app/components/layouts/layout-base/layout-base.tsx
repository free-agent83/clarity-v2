import type { AppUser } from "@/lib/api/users";
import { BuyerNav } from "@/components/shell/buyer-nav";
import { CategoriesMenu } from "@/components/shell/categories-menu";
import { AppFooter } from "@/components/shell/app-footer";

type LayoutBaseProps = {
  children: React.ReactNode;
  user?: AppUser;
};

export function LayoutBase({ children, user }: LayoutBaseProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <BuyerNav user={user} />
      <CategoriesMenu />
      <main className="flex justify-center bg-background">
        <div className="w-full max-w-7xl px-5 pb-[50] pt-5">{children}</div>
      </main>
      <AppFooter />
    </div>
  );
}
