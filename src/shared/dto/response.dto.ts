import { createZodDto } from "nestjs-zod";
import { MessageResSchema } from "../models/response.models";

export class MessageResDto extends createZodDto(MessageResSchema) { };