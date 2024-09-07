
import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any
  interface AxiosResponse<T = any> extends Promise<T> {}
}

abstract class HttpClient {
  protected readonly instance: AxiosInstance;

  public constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
    });

    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError,
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  private _handleResponse = ({ data }: AxiosResponse) => data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _handleError = (error: any) => Promise.reject(error);
}


export default HttpClient;
