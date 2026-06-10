import { ClientSubNav } from "@/components/ClientSubNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientSubNav />
      {children}
    </>
  );
}
