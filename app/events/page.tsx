import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Knock } from "@knocklabs/node";
import { TestEventForm } from "@/components/TestEventForm";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
revalidatePath(`/events`);

const knock = new Knock(process.env.KNOCK_API_KEY);

export default async function TestEvent() {
  const alerts = await knock.objects.list(
    process.env.KNOCK_ALERT_COLLECTION as string
  );
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="grid grid-cols-2 mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Events</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test an event</CardTitle>
          </CardHeader>
          <CardContent>
            <TestEventForm alerts={alerts.entries} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
