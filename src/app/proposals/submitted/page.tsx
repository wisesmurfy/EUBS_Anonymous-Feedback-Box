import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Suspense } from "react";
import { ProposalSubmittedContent } from "./ProposalSubmittedContent";

export default function ProposalSubmittedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <Suspense>
          <ProposalSubmittedContent />
        </Suspense>
      </main>
    </div>
  );
}
