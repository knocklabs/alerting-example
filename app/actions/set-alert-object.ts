"use server";
import { z } from "zod";
import slugify from "slugify";
import { formSchema } from "@/components/SetAlertForm";
import { Knock } from "@knocklabs/node";
import { revalidatePath } from "next/cache";

export default async function setKnockAlertObject(
  values: z.infer<typeof formSchema>
) {
  const knock = new Knock(process.env.KNOCK_API_KEY);
  const objectId = slugify(values.id);

  await knock.objects.set(
    process.env.KNOCK_ALERT_COLLECTION as string,
    objectId,
    {
      name: values.id,
      description: values.description,
      events: values.events,
      channels: values.channels,
      batchWindow: values.batchWindow,
      frequency: values.frequency,
    }
  );
  //Removes subscriptions for recipients that are no longer in the form

  if (values.removedRecipients.length > 0) {
    await knock.objects.deleteSubscriptions(
      process.env.KNOCK_ALERT_COLLECTION as string,
      objectId,
      {
        recipients: values.removedRecipients,
      }
    );
  }
  // Add subscriptions for each recipient
  if (values.recipients.length > 0) {
    await knock.objects.addSubscriptions(
      process.env.KNOCK_ALERT_COLLECTION as string,
      objectId,
      {
        recipients: values.recipients,
      }
    );
  }

  revalidatePath("/", "layout");
}
