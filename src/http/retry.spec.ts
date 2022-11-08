import { HttpModule, HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, retry, throwError } from 'rxjs';
import { genericRetryStrategy } from './retry';

describe('RxJS Retry Strategy', () => {
  let httpService: HttpService;
  const retryStrategy = genericRetryStrategy({
    maxRetryAttempts: 5,
    scalingDuration: 50,
  });

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [],
      imports: [
        HttpModule.register({
          timeout: 30000,
          maxRedirects: 5,
        }),
      ],
    }).compile();

    httpService = testModule.get<HttpService>(HttpService);
  });
  it('should retry if an AxiosError occurred', async () => {
    const err: AxiosError = new AxiosError(
      'TooManyRequests',
      '429',
      {},
      {},
      {
        data: { errors: [{ detail: 'a' }] },
        status: 429,
        statusText: 'TooManyRequests',
        headers: {},
        config: {},
      },
    );
    err.status = 429;

    jest.spyOn(httpService, 'get').mockImplementation(() => {
      return throwError(() => err);
    });

    const mockRetry = jest.fn((err: any, retryCount: number) =>
      retryStrategy(err, retryCount),
    );

    await expect(
      firstValueFrom(
        httpService.get('https://www.example.com').pipe(
          retry({
            delay: mockRetry,
          }),
          catchError((error: AxiosError) => {
            expect(error).toEqual(err);
            throw err;
          }),
        ),
      ),
    ).rejects.toThrow(err);

    expect(mockRetry).toBeCalledTimes(5);
  });
});
