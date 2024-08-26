"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToastAction } from "./ui/toast";
import { useRouter } from "next/navigation";
import setKnockEndpointObject from "../app/actions/set-alert-object";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaginatedEntriesResponse, User } from "@knocklabs/node";

export const formSchema = z.object({
  id: z.string().min(2, {
    message: "Alert ID should be a valid JSON property name",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  events: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  channels: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  batchWindow: z.object({}).nullable(),
  frequency: z.enum(["Immediately", "Daily", "Weekly"]),
  recipients: z.array(z.string()),
  removedRecipients: z.array(z.string()),
});

export function SetAlertForm({
  id,
  description,
  events,
  channels,
  frequency,
  recipients,
  batchWindow,
  users,
}: {
  id?: string;
  description?: string;
  events?: string[];
  channels?: string[];
  frequency?: "Immediately" | "Daily" | "Weekly";
  batchWindow?: {
    frequency?: "daily" | "weekly";
    days?: string[] | string;
    hours?: number;
  } | null;
  recipients?: string[];
  users?: PaginatedEntriesResponse<User>;
}) {
  // 1. Define your form.
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialRecipients, setInitialRecipients] = useState<string[]>([]);
  const alertEvents = [
    {
      id: "server:info",
      label: "Server info",
    },
    {
      id: "server:warn",
      label: "Server warn",
    },
    {
      id: "server:alert",
      label: "Server alert",
    },
  ] as const;
  const channelOptions = [
    {
      id: "sms",
      label: "SMS",
    },
    {
      id: "email",
      label: "Email",
    },
    {
      id: "in-app",
      label: "In-App",
    },
  ] as const;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id || `alert_${uuidv4()}`,
      description: description || "",
      events: events || ["server:info", "server:warn", "server:alert"],
      channels: channels || ["sms", "email", "in-app"],
      frequency: getBatchWindowValue(batchWindow) || "Immediately",
      recipients: recipients || [],
      removedRecipients: [],
      batchWindow: batchWindow || null,
    },
  });

  useEffect(() => {
    if (recipients && recipients.length > 0) {
      setInitialRecipients(recipients);
    }
  }, [recipients]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    //convert frequency to batchWindow
    values.batchWindow = getFrequencyValue(values.frequency);
    await setKnockEndpointObject(values);
    toast({
      title: "Alert data set",
      description: `The alert was created or updated.`,
      action: (
        <ToastAction altText="View alert" onClick={() => router.push("/")}>
          View alerts
        </ToastAction>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert Id</FormLabel>
              <FormControl>
                <Input placeholder="test-alert" {...field} />
              </FormControl>
              <FormDescription>
                This must be a valid JSON property name. It should only contain
                alphanumeric characters, underscores, and hyphens.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us more about the alert"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="events"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Event subscriptions</FormLabel>
                <FormDescription>
                  Select the events you want send to your alert.
                </FormDescription>
              </div>
              {alertEvents.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="events"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="channels"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Channels</FormLabel>
                <FormDescription>
                  Select the channels you want to use.
                </FormDescription>
              </div>
              {channelOptions.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="channels"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Immediately">Immediately</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recipients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipients</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input
                    disabled
                    value={`${field.value.length} recipient(s)`}
                    className="w-[200px]"
                  />
                </FormControl>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      Manage
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Recipients</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-2">
                      {users?.entries.map((user) => (
                        <FormItem
                          key={user.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(user.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, user.id]);
                                  form.setValue(
                                    "removedRecipients",
                                    form
                                      .getValues("removedRecipients")
                                      .filter((id) => id !== user.id)
                                  );
                                } else {
                                  field.onChange(
                                    field.value.filter((id) => id !== user.id)
                                  );
                                  if (initialRecipients.includes(user.id)) {
                                    form.setValue("removedRecipients", [
                                      ...form.getValues("removedRecipients"),
                                      user.id,
                                    ]);
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {user.email || user.id}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
function getFrequencyValue(frequency: string) {
  switch (frequency) {
    case "Immediately":
      return null;
    case "Daily":
      return {
        frequency: "daily",
        days: "weekdays",
        hours: 14,
      };
    case "Weekly":
      return {
        frequency: "weekly",
        days: ["fri"],
        hours: 14,
      };
    default:
      return null;
  }
}

function getBatchWindowValue(
  batchWindow:
    | {
        frequency?: string;
        days?: string[] | string;
        hours?: number;
      }
    | null
    | undefined
) {
  if (!batchWindow) {
    return "Immediately";
  }
  switch (batchWindow.frequency) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    default:
      return "Immediately";
  }
}
