import { z } from 'zod';

import type { AppEvent, EventSpeaker } from '../../data/events';
import { collectionRef, docRef } from '../firebase/firestore';

const asString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return false;
};

const FlexibleNumber = z.union([z.number(), z.string()]).transform((value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
});

const FlexibleBoolean = z.union([z.boolean(), z.string(), z.number()]).transform(toBoolean);

const SpeakerSchema = z.object({
  id: z.string().optional().default(''),
  name: z.string().default(''),
  title: z.string().default(''),
});

const EventSchema = z.object({
  eventName: z.string().default('Untitled Event'),
  organizationName: z.string().default(''),
  category: z.string().default('General'),
  description: z.string().default(''),
  startDate: z.unknown().transform(asString).default(''),
  endDate: z.unknown().transform(asString).default(''),
  time: z.unknown().transform(asString).default(''),
  isMultiDay: FlexibleBoolean.default(false),
  isOnline: FlexibleBoolean.default(false),
  location: z.string().default(''),
  capacity: FlexibleNumber.default(0),
  isPopular: FlexibleBoolean.default(false),
  price: FlexibleNumber.default(0),
  speakers: z.array(SpeakerSchema).default([]),
});

type EventDocument = z.infer<typeof EventSchema>;

const pickFirstString = (source: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return '';
};

const formatDateLabel = (event: EventDocument): string => {
  const start = event.startDate || 'TBD';
  const end = event.endDate || event.startDate || '';
  const dateRange = event.isMultiDay && end ? `${start} - ${end}` : start;
  return event.time ? `${dateRange} ${event.time}` : dateRange;
};

const formatTicketPrice = (price: number): string => {
  if (price === 0) {
    return 'Free';
  }
  return `$${price}`;
};

const mapSpeakers = (speakers: EventDocument['speakers'], organizationName: string): EventSpeaker[] =>
  speakers.map((speaker) => ({
    name: speaker.name,
    role: speaker.title,
    company: organizationName || 'Event Speaker',
  }));

const toAppEvent = (id: string, event: EventDocument, raw: Record<string, unknown>): AppEvent => ({
  id,
  name:
    pickFirstString(raw, ['eventName', 'name', 'title', 'event_name', 'event_title']) ||
    event.eventName ||
    'Untitled Event',
  location: event.isOnline ? 'Online' : event.location || 'TBD',
  date: formatDateLabel(event),
  venue: event.organizationName || event.location || 'TBD',
  attendeeCount: event.capacity > 0 ? String(event.capacity) : 'TBD',
  category: event.category || 'General',
  ticketPrice: formatTicketPrice(event.price),
  description: event.description || 'No description available.',
  speakers: mapSpeakers(event.speakers, event.organizationName),
  agenda: [],
  highlights: [],
  tags: [event.category || 'General', event.isOnline ? 'Online' : 'In-Person'],
});

export const getPopularEvents = async (): Promise<AppEvent[]> => {
  const snapshot = await collectionRef<Record<string, unknown>>('events').where('isPopular', '==', true).get();
  const events = snapshot.docs
    .map((eventDoc) => {
      const rawData = eventDoc.data() ?? {};
      const parsed = EventSchema.safeParse(rawData);
      if (!parsed.success) {
        return null;
      }
      return toAppEvent(eventDoc.id, parsed.data, rawData);
    })
    .filter((event): event is AppEvent => event !== null);

  return events;
};

export const getAllEvents = async (): Promise<AppEvent[]> => {
  const snapshot = await collectionRef<Record<string, unknown>>('events').get();
  const events = snapshot.docs
    .map((eventDoc) => {
      const rawData = eventDoc.data() ?? {};
      const parsed = EventSchema.safeParse(rawData);
      if (!parsed.success) {
        return null;
      }
      return toAppEvent(eventDoc.id, parsed.data, rawData);
    })
    .filter((event): event is AppEvent => event !== null);

  return events;
};

export const getEventById = async (eventId: string): Promise<AppEvent | null> => {
  const snapshot = await docRef<Record<string, unknown>>(`events/${eventId}`).get();
  if (!snapshot.exists) {
    return null;
  }

  const rawData = snapshot.data() ?? {};
  const parsed = EventSchema.safeParse(rawData);
  if (!parsed.success) {
    return null;
  }

  return toAppEvent(snapshot.id, parsed.data, rawData);
};
