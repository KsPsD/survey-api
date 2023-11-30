import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';

@Catch(HttpException)
export class GqlHttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = exception.getResponse();

    const errorMessage =
      typeof response === 'string' ? response : response['message'];

    const errorCode = this.getErrorCode(status);

    return new ApolloError(errorMessage, errorCode, {
      httpStatusCode: status,
    });
  }

  private getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 404:
        return 'NOT_FOUND';
      case 403:
        return 'FORBIDDEN';
      case 401:
        return 'UNAUTHORIZED';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
