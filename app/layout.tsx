import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "react-deferred-link-web",
  description: "Deferred deep link landing page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
