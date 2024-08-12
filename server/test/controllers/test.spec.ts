import TestAgent from "supertest/lib/agent";
import { procureHttpAgent } from "../helpers";

describe('Test Controller', () => {
    let agent : TestAgent = procureHttpAgent();

    it('Can hit test endpoint', (done) => {
        agent.get('/api/test')
            .expect(200);
        done();
    })
})