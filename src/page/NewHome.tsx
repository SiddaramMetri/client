import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "@/components/data/data.json";
import MultiStepStudentRegistration from "@/page/dashboard/students/components/MultiStepStudentRegistration";

export default function NewHome() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <MultiStepStudentRegistration />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
}
