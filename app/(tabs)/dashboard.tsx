import { DashboardScreen } from "../../src/features/dashboard";
import { RequireAuth } from "../../src/features/navigation";

export default function DashboardRoute() {
  return (
    <RequireAuth>
      <DashboardScreen />
    </RequireAuth>
  );
}
