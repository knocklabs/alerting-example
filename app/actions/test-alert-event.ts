"use server";
import { z } from "zod";
import { formSchema } from "@/components/TestEventForm";
import { Knock } from "@knocklabs/node";
import { revalidatePath } from "next/cache";

export default async function testAlertEvent(
  values: z.infer<typeof formSchema>
) {
  const knock = new Knock(process.env.KNOCK_API_KEY);
  const alertRef = await knock.objects.get(
    process.env.KNOCK_ALERT_COLLECTION as string,
    values.alertId
  );
  const workflow_run_id = await knock.workflows.trigger(
    process.env.KNOCK_ALERT_WORKFLOW_KEY as string,
    {
      recipients: [
        {
          id: values.alertId,
          collection: process.env.KNOCK_ALERT_COLLECTION as string,
        },
      ],
      data: {
        alert: {
          ...alertRef.properties,
        },
        event: values.eventType,
      },
    }
  );
  revalidatePath("/", "layout");
  return workflow_run_id;
}
