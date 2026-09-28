import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ring Cerberus - Autonomous Defensive Swarm & Zero-Trust Lockdown',
  description: 'Tactical Cyber-Defense Perimeter HUD powered by AWS Bedrock Swarm & Ring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cyber-dark text-gray-100 antialiased">{children}</body>
    </html>
  );
}
