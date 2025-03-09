import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AccessTokenPayloadDecoded } from "../types/jwt.type";
import { REQUEST_CONSTANTS } from "../constants/request.constants";

export const ActiveUser = createParamDecorator((field: keyof AccessTokenPayloadDecoded | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: AccessTokenPayloadDecoded | undefined = request[REQUEST_CONSTANTS.DECODED_ACCESS_TOKEN_KEY];
    return field ? user?.[field] : user;
});
