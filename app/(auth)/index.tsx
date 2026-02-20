import { AuthScreen } from '../../src/features/auth';
import { RequireGuest } from '../../src/features/navigation';

export default function AuthRoute() {
  return (
    <RequireGuest>
      <AuthScreen />
    </RequireGuest>
  );
}
