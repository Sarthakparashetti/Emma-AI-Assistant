import { Cpu, MemoryStick, BatteryMedium, HardDrive } from "lucide-react";
import StatusCard from "./StatusCard";

interface Props {
  system: {
    cpu: number;
    ram: number;
    battery: number;
    disk: number;
  };
}

function StatusGrid({ system }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatusCard
        title="CPU Usage"
        value={`${system.cpu}%`}
        percent={system.cpu}
        icon={Cpu}
      />

      <StatusCard
        title="RAM Usage"
        value={`${system.ram}%`}
        percent={system.ram}
        icon={MemoryStick}
      />

      <StatusCard
        title="Battery"
        value={`${system.battery}%`}
        percent={system.battery}
        icon={BatteryMedium}
      />

      <StatusCard
        title="Disk Usage"
        value={`${system.disk}%`}
        percent={system.disk}
        icon={HardDrive}
      />
    </div>
  );
}

export default StatusGrid;
