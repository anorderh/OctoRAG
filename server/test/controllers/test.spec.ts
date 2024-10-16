import { Agent } from "../agent.js";
import { expect } from "chai";
import { env } from "src/shared/utils/constants/env.js";
import cookie from 'cookie';

let creds = {
    username: "anthony",
    email: "anthony@norderhaug.org",
    password: "password123",
}
describe('Test Controller', () => {
    let testAgent : Agent = new Agent();

    describe('Test auth endpoint', () => {
        let accessToken: string;
        let refreshToken: string;

        it('Log into account', async () => {
            let res = await testAgent.http.post('/api/auth/login', {
                username: creds.username,
                password: creds.password
            })

            expect(res.status).to.equal(200);

            let body = res.data;

            let _accessToken = body.token;
            expect(_accessToken)
                .to.not.be.empty
                .and.to.not.be.null

            let _refreshToken = testAgent.getCookie(env.tokens.refresh.name);
            expect(_refreshToken)
                .to.not.be.empty
                .and.to.not.be.null

            accessToken = _accessToken;
            refreshToken = _refreshToken!;
        });

        it('Can hit and complete endpoint', async () => {
            let res = await testAgent.http.get('/api/test', {
                headers: {
                    'Authorization': accessToken
                }
            })
            expect(res.status).to.equal(200);
        })

        it('Denied when no authorization present', async ()  => {
            let res = await testAgent.http.get('/api/test')
            expect(res.status).to.equal(401);
        })
    })
})