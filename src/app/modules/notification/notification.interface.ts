import { Schema } from "mongoose";

export interface TNotification {
  type: "like" | "comment" | "reply";
  blog: Schema.Types.ObjectId;
  notificationFor: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  comment?: Schema.Types.ObjectId;
  reply?: Schema.Types.ObjectId;
  repliedOnComment?: Schema.Types.ObjectId;
  seen?: boolean;
}

export interface TNotificationQuery {
  page: number;
  filter: string;
  deletedDocCount: number;
}

export interface TGetNotificationQuery {
  notificationFor: string;
  user: unknown;
  type?: string;
}
