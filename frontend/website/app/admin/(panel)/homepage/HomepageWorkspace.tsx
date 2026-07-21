"use client";

import type { HomepageSectionRow } from "@/type/db";
import { HomepageTable } from "./HomepageTable";

export function HomepageWorkspace({
  sections,
  canWrite,
}: {
  sections: HomepageSectionRow[];
  canWrite: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Drag to reorder. Edit a section to control its content. Open Banner to
        manage slides, stats, and marquee.
      </p>
      <HomepageTable data={sections} canWrite={canWrite} />
    </div>
  );
}
