import Link from "next/link";

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ewha-700">
            <span className="text-xs font-bold text-white">E</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-none tracking-tight text-ewha-700">EUBS</p>
            <p className="text-[10px] leading-none text-gray-400">익명 소리함</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {showNav && (
            <nav className="flex items-center gap-1">
              <Link
                href="/submit"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-ewha-50 hover:text-ewha-700 transition-colors"
              >
                소리함
              </Link>
              <Link
                href="/proposals/questions"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-ewha-50 hover:text-ewha-700 transition-colors"
              >
                기획안 Q&A
              </Link>
            </nav>
          )}
          <Link
            href="/admin"
            className="ml-2 flex items-center gap-1.5 rounded-lg border border-ewha-200 bg-ewha-50 px-3 py-1.5 text-xs font-semibold text-ewha-700 hover:bg-ewha-100 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            국부국
          </Link>
        </div>
      </div>
    </header>
  );
}
