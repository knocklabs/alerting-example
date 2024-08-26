import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Table, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Edit, Plus, Siren } from "lucide-react";
import { Knock } from "@knocklabs/node";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
revalidatePath("/", "layout");

export default async function Dashboard() {
  const knock = new Knock(process.env.KNOCK_API_KEY);
  let alerts = null;
  try {
    alerts = await knock.objects.list(
      process.env.KNOCK_ALERT_COLLECTION as string
    );
  } catch (e) {
    console.error("Error fetching alerts:", e);
  }

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Alerts</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href="/alerts/new">
            <Button>
              <Plus className="mr-2" /> Add Alert
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configured Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts && alerts.entries.length > 0 ? (
              <Table>
                <TableBody>
                  {alerts.entries.map((alertObject) => (
                    <TableRow
                      key={alertObject.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="w-1/4">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Siren className="mr-2 text-primary" />
                            <span className="font-medium">
                              {alertObject.id}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-light mt-1">
                            {alertObject.properties.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="w-2/3">
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="text-sm font-medium mr-2 mb-4">
                              Channels:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {alertObject.properties.channels.map(
                                (channel: string) => (
                                  <span
                                    key={channel}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                  >
                                    {channel}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium mr-2 mb-4">
                              Events:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {alertObject.properties.events.map(
                                (event: string) => (
                                  <span
                                    key={event}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                  >
                                    {event}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium mr-2 mb-4">
                              Frequency:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {alertObject.properties.frequency}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-1/12 text-right">
                        <Link href={`/alerts/${alertObject.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No alerts found</p>
                <Link href="/alerts/new">
                  <Button>
                    <Plus className="mr-2" /> Create your first alert
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
