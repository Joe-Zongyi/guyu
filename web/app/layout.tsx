import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "谷雨 Guyu",
  description: "AI 绿植养护助手首页概念稿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
