"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import testAlertEvent from "../app/actions/test-alert-event";
import { ToastAction } from "./ui/toast";

export const formSchema = z.object({
  alertId: z.string().min(2, {}),
  eventType: z.enum(["server:alert", "server:warn", "server:info"], {
    required_error: "You need to select a notification type.",
  }),
});

interface alert {
  id: string;
  properties: Record<string, any>;
}

export function TestEventForm({ alerts }: { alerts: alert[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await testAlertEvent(values);
    toast({
      title: "Test alert sent",
      description: `The ${values.eventType} alert was sent.`,
      action: (
        <ToastAction altText="View alerts" onClick={() => router.push("/")}>
          View Alerts
        </ToastAction>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="alertId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an alert to send a test event" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {alerts.map((alert) => (
                    <SelectItem value={alert.id} key={alert.id}>
                      {alert.properties.description} | {alert.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select an alert to send a test event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available events</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="server:alert" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Server alert (server:alert)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="server:warn" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Server warning (server:warn)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="server:info" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Server info (server:info)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Send Test Alert</Button>
      </form>
    </Form>
  );
}
