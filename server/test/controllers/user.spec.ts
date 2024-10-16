import { Agent } from "../agent.js";
import { expect } from "chai";
import { env } from "src/shared/utils/constants/env.js";
import cookie from 'cookie';
import { Database } from "../database.js";

let creds = {
    username: "anthony",
    email: "anthony@norderhaug.org",
    password: "password123",
}
let dummyAcc = {
    username: 'poppydolly123',
    email: 'poppytheman@gmail.com',
    password: 'password123'
}
describe('User Controller', () => {
    describe('Get self endpoint', () => {
        let agent: Agent = new Agent();

        it('Get self', async () => {
            await agent.login(creds.username, creds.password);
            let res = await agent.http.get('/api/user/');
            let data = res.data;

            expect(res.status).to.equal(200);
            expect(data.username).to.equal(creds.username);
        })

        it('Unauthorized', async () => {
            agent.deleteHeader('Authorization');
            let res = await agent.http.get('/api/user/');

            expect(res.status).to.equal(401);
        })
    })

    describe('Edit self endpoint', () => {
        let agent: Agent = new Agent();
        let changes = {
            pfpPath: 'www.google.com',
            desc: 'fake desc'
        };

        it('Edit self', async () => {
            await agent.login(creds.username, creds.password);
            let res = await agent.http.patch('/api/user/edit', changes);
            expect(res.status).to.equal(200)
        })

        it('Fail validation', async () => {
            let res = await agent.http.patch('/api/user/edit', {
                password: "superDuperObvPw"
            });
            expect(res.status).to.equal(400)
        })

        it('Fail auth', async () => {
            agent.deleteHeader('Authorization');
            let res = await agent.http.patch('/api/user/edit', {});
            expect(res.status).to.equal(401)
        })
    })

    describe('Get user', () => {
        let agent: Agent = new Agent();

        it('Get user', async () => {
            let res = await agent.http.get(`/api/user/${dummyAcc.username}`);
            expect(res.status).to.equal(200);
        })

        it('Invalid user', async () => {
            await agent.login(creds.username, creds.password);

            let res = await agent.http.get(`/api/user/patromi`);
            expect(res.status).to.equal(409);
        })
    });
})