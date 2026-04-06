import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ewha-700">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">EUBS 관리자</h1>
          <p className="mt-1 text-sm text-gray-500">국부국 전용 페이지입니다</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
