import StreamClientProvider from "@/components/providers/StreamClientProvider";
import Navbar from "@/components/Navbar";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <StreamClientProvider>
          <div className="min-h-screen">
            <Navbar />
            <main className="px-4 sm:px-6 lg:px-8">{children}</main>
          </div>
        </StreamClientProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}