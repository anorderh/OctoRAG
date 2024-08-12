import request from 'supertest';
import { env } from "../src/env";

export let procureHttpAgent = () => request.agent(env.server.origin);