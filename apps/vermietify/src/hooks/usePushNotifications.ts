import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SendNotificationOptions {
  to?: string;       // FCM token for a specific device
  topic?: string;    // FCM topic (e.g. "tenant_123" for all devices of a tenant)
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

interface PushResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Hook for sending push notifications via Firebase Cloud Messaging.
 *
 * Usage:
 * ```tsx
 * const { sendNotification, isSending } = usePushNotifications();
 *
 * // Send to specific device
 * await sendNotification({
 *   to: tenantFcmToken,
 *   title: "Zaehlerablesung faellig",
 *   body: "Bitte lesen Sie Ihre Zaehler bis zum 31.12. ab.",
 *   data: { screen: "meter-reading" },
 * });
 *
 * // Send to topic (all devices of a tenant)
 * await sendNotification({
 *   topic: `tenant_${tenantId}`,
 *   title: "Neues Dokument",
 *   body: "Ihr Vermieter hat ein neues Dokument hochgeladen.",
 * });
 * ```
 */
export function usePushNotifications() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = useCallback(async (
    options: SendNotificationOptions
  ): Promise<PushResult> => {
    setIsSending(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "send-push-notification",
        { body: options }
      );

      if (fnError) throw fnError;

      if (data?.error) {
        setError(data.error);
        return { success: false, error: data.error };
      }

      return { success: true, messageId: data.messageId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Push-Benachrichtigung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendBulk = useCallback(async (
    tokens: string[],
    notification: Omit<SendNotificationOptions, "to" | "topic">
  ): Promise<PushResult[]> => {
    const results = await Promise.allSettled(
      tokens.map((token) =>
        sendNotification({ ...notification, to: token })
      )
    );

    return results.map((r) =>
      r.status === "fulfilled" ? r.value : { success: false, error: "Sende-Fehler" }
    );
  }, [sendNotification]);

  return { sendNotification, sendBulk, isSending, error };
}
