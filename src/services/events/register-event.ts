import { z } from 'zod';

import type { AppEvent } from '../../data/events';
import { docRef } from '../firebase/firestore';
import { getFirestore } from '../firebase/client';

const RegisterPayloadSchema = z.object({
  userId: z.string().min(1),
  event: z.object({
    id: z.string().min(1),
    name: z.string(),
    location: z.string(),
    date: z.string(),
    venue: z.string(),
    attendeeCount: z.string(),
    category: z.string(),
    ticketPrice: z.string(),
    description: z.string(),
    speakers: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        company: z.string(),
      }),
    ),
    agenda: z.array(
      z.object({
        time: z.string(),
        title: z.string(),
        speaker: z.string().optional(),
      }),
    ),
    highlights: z.array(z.string()),
    tags: z.array(z.string()),
  }),
});

type UserDoc = {
  registeredEvents?: AppEvent[];
};

type EventDoc = {
  registeredUserIds?: string[];
};

const toRegisteredEvents = (value: unknown): AppEvent[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is AppEvent => {
    return (
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as { id?: unknown }).id === 'string' &&
      typeof (item as { name?: unknown }).name === 'string'
    );
  });
};

const upsertRegisteredEvent = (events: AppEvent[], event: AppEvent): AppEvent[] => {
  const existingIndex = events.findIndex((existing) => existing.id === event.id);
  if (existingIndex === -1) {
    return [...events, event];
  }

  const next = [...events];
  next[existingIndex] = event;
  return next;
};

export const registerUserForEvent = async (userId: string, event: AppEvent): Promise<void> => {
  const payload = RegisterPayloadSchema.parse({ userId, event });
  const db = getFirestore();
  const eventRef = docRef<EventDoc>(`events/${payload.event.id}`);
  const userRef = docRef<UserDoc>(`users/${payload.userId}`);

  await db.runTransaction(async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    const userSnapshot = await transaction.get(userRef);

    const currentEventData = (eventSnapshot.data() ?? {}) as EventDoc;
    const currentUserData = (userSnapshot.data() ?? {}) as UserDoc;

    const currentRegisteredUserIds = Array.isArray(currentEventData.registeredUserIds)
      ? currentEventData.registeredUserIds.filter((id): id is string => typeof id === 'string')
      : [];
    const nextRegisteredUserIds = currentRegisteredUserIds.includes(payload.userId)
      ? currentRegisteredUserIds
      : [...currentRegisteredUserIds, payload.userId];

    const currentRegisteredEvents = toRegisteredEvents(currentUserData.registeredEvents);
    const nextRegisteredEvents = upsertRegisteredEvent(currentRegisteredEvents, payload.event);

    transaction.set(
      eventRef,
      {
        registeredUserIds: nextRegisteredUserIds,
      },
      { merge: true },
    );

    transaction.set(
      userRef,
      {
        registeredEvents: nextRegisteredEvents,
      },
      { merge: true },
    );
  });
};
