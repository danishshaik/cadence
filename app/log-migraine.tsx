import { LogMigraineFlow, LogMigraineFlowRefactor } from "@components/migraine";
import { FlowSwitcher } from "@components/tracking";

export default function LogMigraineModal() {
  return (
    <FlowSwitcher
      tracker="migraine"
      legacyFlow={<LogMigraineFlow />}
      newFlow={<LogMigraineFlowRefactor />}
    />
  );
}
