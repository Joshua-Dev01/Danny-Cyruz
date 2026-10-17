import AdminGate from "@/components/AdminGate";

// Everything inside app/admin/(protected) needs an admin sign-in. The login page sits outside this folder.
export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
