import { SubNav } from "@/components/SubNav";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SubNav />
      {children}
    </>
  );
}
