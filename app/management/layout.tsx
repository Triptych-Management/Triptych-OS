import { ArtistSubNav } from "@/components/ArtistSubNav";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ArtistSubNav />
      {children}
    </>
  );
}
