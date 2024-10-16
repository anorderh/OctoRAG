
import { env } from 'src/shared/utils/constants/env';
import axios, { Axios, AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic, CreateAxiosDefaults } from 'axios';
import { expect, assert} from "chai";
import {wrapper} from 'axios-cookiejar-support';
import { Cookie, CookieJar } from "tough-cookie";
export class Agent {
    jar: CookieJar;
    axiosInstance: AxiosInstance | AxiosStatic

    constructor(config?: CreateAxiosDefaults) {
        this.jar = new CookieJar();
        this.axiosInstance = wrapper(
            axios.create({
                baseURL: env.server.origin,
                withCredentials: true,
                jar: this.jar,
                validateStatus: () => true, // Don't throw errors on failed requests.
                ...(config ?? {}),
            })
    )}

    public async register(username: string, email: string, password: string) {
        return await this.http.post(
            '/api/auth/register', {
                username: username,
                email: email,
                password: password
            }
        );
    }

    public async login(username: string, password: string) {
        let res = await this.http.post('/api/auth/login', {
            username: username,
            password: password
        })

        // Save authorization.
        let body = res.data;
        let _accessToken = body.token;
        this.addHeader('Authorization', _accessToken);

        return res;
    }

    public addHeader(name: string, value: string) {
        this.axiosInstance.defaults.headers.common[name] = value;
    }

    public deleteHeader(name: string) {
        delete this.axiosInstance.defaults.headers.common[name];
    }

    public getCookies = () => this.jar.getCookiesSync(env.server.origin);

    public getCookie(name: string) : string | null {
        let cookies = this.jar.getCookiesSync(env.server.origin);
        let cookie = cookies.find(c => c.key == name);
        return cookie?.value ?? null;
    }

    public addCookie(name: string, value: string) {
        this.jar.setCookieSync(
            new Cookie({
                key: name, value: value
            }),
            env.server.origin
        );
    }

    public expireCookie(name: string) {
        let cookies = this.jar.getCookiesSync(env.server.origin);
        let cookie = cookies.find(c => c.key == name);
        if (cookie != undefined) {
            cookie.expires = new Date(Date.now());
        }
    }

    public clearCookies = () => this.jar.removeAllCookiesSync();

    public http = {
        get: async (url: string, config?: AxiosRequestConfig) => {
            let res = await this.axiosInstance.get(url, config);
            // console.log(`\nRESPONSE:\n${this.formatResponse(res.data)}\n`);
            return res;
        },
        post: async (url: string, body?: any, config?: AxiosRequestConfig) => {
            let res = await this.axiosInstance.post(url, body, config);
            // console.log(`\nRESPONSE:\n${this.formatResponse(res.data)}\n`);;
            return res;
        },
        patch: async (url: string, body?: any, config?: AxiosRequestConfig) => {
            let res = await  this.axiosInstance.patch(url, body, config);
            // console.log(`\nRESPONSE:\n${this.formatResponse(res.data)}\n`);;
            return res;
        },
        delete: async (url: string,  config?: AxiosRequestConfig) => {
            let res = await this.axiosInstance.delete(url, config);
            // console.log(`\nRESPONSE:\n${this.formatResponse(res.data)}\n`);
            return res;
        },
    }

    private formatResponse = (data: any) => JSON.stringify(data, null, 2);
}