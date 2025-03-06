import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TokenPayloadType } from "../types/jwt.type";
import { REQUEST_CONSTANTS } from "../constants/request.constants";

export const ActiveUser = createParamDecorator((field: keyof TokenPayloadType | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: TokenPayloadType | undefined = request[REQUEST_CONSTANTS.DECODED_ACCESS_TOKEN_KEY];
    return field ? user?.[field] : user;
});
