import { Agent } from "../agent.js";
import { expect } from "chai";
import { env } from "../../src/env.js";
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

    describe('Get notifications', () => {
        let agent: Agent = new Agent();

        it('Get notifs', async () => {
            await agent.login(creds.username, creds.password);
            let res = await agent.http.get('/api/user/notifs');
            expect(res.status).to.equal(200);
        })

        it('Fail auth', async () => {
            agent.deleteHeader('Authorization');
            let res = await agent.http.get('/api/user/notifs');
            expect(res.status).to.equal(401);
        })
    })

    describe('Get feed', () => {
        let agent: Agent = new Agent();

        it('Get feed', async () => {
            await agent.register(creds.username, creds.email, creds.password);
            await agent.login(creds.username, creds.password);
            let res = await agent.http.get('/api/user/feed');
            expect(res.status).to.equal(200);
        })

        it('Apply pagination', async () => {
            await agent.login(creds.username, creds.password);
            let res = await agent.http.get('/api/user/feed?skip=10&limit=5');
            let data = res.data;

            expect(res.status).to.equal(200);
            expect(data.length).to.be.lessThanOrEqual(5);
        })

        it('Fail validation', async () => {
            await agent.login(creds.username, creds.password);
            let res = await agent.http.get('/api/user/feed?skip=10&take=25');
            expect(res.status).to.equal(400);
        })

        it('Apply faulty pagination', async () => {
            await agent.login(creds.username, creds.password);
            let res = await agent.http.get('/api/user/feed?skip=10&limit=1000');
            expect(res.status).to.equal(400);
        })

        it('Fail auth', async () => {
            agent.deleteHeader('Authorization');
            let res = await agent.http.get('/api/user/feed');
            expect(res.status).to.equal(401);
        })
    })

    describe('Get users boards', () => {
        let agent: Agent = new Agent();

        it('Get boards', async () => {
            let res = await agent.http.get('/api/user/anthony/boards');
            expect(res.status).to.equal(200);
        })

        it('User not found', async () => {
            let res = await agent.http.get('/api/user/flamingo/boards');
            expect(res.status).to.equal(409);
        })
    });

    describe('Get users boards', () => {
        let agent: Agent = new Agent();

        it('Get boards', async () => {
            let res = await agent.http.get('/api/user/anthony/boards');
            expect(res.status).to.equal(200);
        })

        it('User not found', async () => {
            let res = await agent.http.get('/api/user/flamingo/boards');
            expect(res.status).to.equal(409);
        })
    });

    describe('Follow user', () => {
        let agent: Agent = new Agent();

        it('Follow', async () => {
            await agent.register(
                creds.username,
                creds.email,
                creds.password
            );
            await agent.register(
                dummyAcc.username,
                dummyAcc.email,
                dummyAcc.password
            );
            await agent.login(creds.username, creds.password);

            let res = await agent.http.post(`/api/user/${dummyAcc.username}/follow`);
            expect(res.status).to.equal(200);
        })

        it('Invalid user', async () => {
            await agent.login(creds.username, creds.password);

            let res = await agent.http.post(`/api/user/fakeuser/follow`);
            expect(res.status).to.equal(409);
        })

        it('Follow self', async () => {
            await agent.login(creds.username, creds.password);

            let res = await agent.http.post(`/api/user/${creds.username}/follow`);
            expect(res.status).to.equal(405);
        })
    });

    describe('Unfollow user', () => {
        let agent: Agent = new Agent();

        it('Unfollow', async () => {
            await agent.login(creds.username, creds.password);

            let res = await agent.http.post(`/api/user/${dummyAcc.username}/unfollow`);
            expect(res.status).to.equal(200);
        })

        it('Invalid user', async () => {
            await agent.login(creds.username, creds.password);

            let res = await agent.http.post(`/api/user/fakeuser/unfollow`);
            expect(res.status).to.equal(409);
        })

        it('Unfollow self', async () => {
            await agent.login(creds.username, creds.password);

            let res = await agent.http.post(`/api/user/${creds.username}/unfollow`);
            expect(res.status).to.equal(405);
        })
    });

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