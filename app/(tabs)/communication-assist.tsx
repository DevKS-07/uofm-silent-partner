import { CommunicationAssistScreen } from '../../src/features/communication-assist';
import { RequireAuth } from '../../src/features/navigation';

export default function CommunicationAssistRoute() {
  return (
    <RequireAuth>
      <CommunicationAssistScreen />
    </RequireAuth>
  );
}
