import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { SetAlertForm } from "@/components/SetAlertForm";
import { Knock } from "@knocklabs/node";

export default async function NewAlert() {
  const knock = new Knock(process.env.KNOCK_API_KEY);
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
                <BreadcrumbLink href="/alerts/new">New Alert</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add an alert</CardTitle>
          </CardHeader>
          <CardContent>
            <SetAlertForm users={users} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
