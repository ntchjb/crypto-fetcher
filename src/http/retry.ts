import { Logger } from '@nestjs/common';
import { ObservableInput, throwError, timer } from 'rxjs';

export const genericRetryStrategy =
  ({
    maxRetryAttempts = 3,
    scalingDuration = 1000,
    excludedStatusCodes = [],
    logger = new Logger('Axios retry'),
  }: {
    maxRetryAttempts?: number;
    scalingDuration?: number;
    excludedStatusCodes?: number[];
    logger?: Logger;
  } = {}) =>
  (error: any, retryCount: number): ObservableInput<any> => {
    // if maximum number of retries have been met
    // or response is a status code we don't wish to retry, throw error
    logger.debug('Retry begins', error);
    if (
      retryCount > maxRetryAttempts ||
      excludedStatusCodes.find((e) => e === error.status)
    ) {
      return throwError(() => error);
    }
    logger.log(
      `Attempt ${retryCount}: retrying in ${retryCount * scalingDuration}ms`,
    );
    // retry after 1s, 2s, etc...
    return timer(retryCount * scalingDuration);
  };
