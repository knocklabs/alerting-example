import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Knock } from "@knocklabs/node";
import { SetAlertForm } from "@/components/SetAlertForm";

export const dynamic = "force-dynamic";

export default async function AlertDetails({
  params,
}: {
  params: { alertId: string };
}) {
  const knock = new Knock(process.env.KNOCK_API_KEY);
  const alert = await knock.objects.get(
    process.env.KNOCK_ALERT_COLLECTION as string,
    params.alertId
  );
  const subscriptions = await knock.objects.listSubscriptions(
    process.env.KNOCK_ALERT_COLLECTION as string,
    params.alertId
  );
  const recipients = subscriptions.entries.map(
    (subscription) => subscription.recipient.id
  );
  const users = await knock.users.list();

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="grid grid-cols-2 mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Alerts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{alert.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <SetAlertForm
              id={alert.id}
              description={alert.properties.description}
              events={alert.properties.events}
              channels={alert.properties.channels}
              frequency={alert.properties.frequency}
              recipients={recipients}
              users={users}
              batchWindow={alert.properties.batchWindow}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
