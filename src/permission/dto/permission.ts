import { ObjectId } from "bson";

export type Access = {
      action: string[]
}
export class PermissionDTO {
      readonly _id: ObjectId;
      readonly name: string[];
      readonly accesses: Access[]
}