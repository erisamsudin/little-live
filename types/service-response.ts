import { HttpStatus } from "@nestjs/common";

export class ServiceResponse {
    status: boolean;
    message: string;
    data: any;
    statusCode: HttpStatus
}