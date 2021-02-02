import { ObjectId } from "bson";
import { Access } from "./permission";

export interface PermissionUpdateDto {
    readonly _id : ObjectId;
    readonly accesses: Access[]
}