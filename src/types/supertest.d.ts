declare module 'supertest' {
  interface Response {
    status: number
    statusCode: number
    text: string
    body: unknown
    headers: Record<string, string>
    type: string
    ok: boolean
  }

  interface Test {
    expect(status: number): Test
    expect(field: string, val: string): Test
    end(cb: (err: unknown, res: Response) => void): void
    then(resolve: (res: Response) => void, reject?: (err: unknown) => void): Promise<void>
    send(body: unknown): Test
    set(field: string, val: string): Test
    set(obj: Record<string, string>): Test
    timeout(ms: number): Test
  }

  interface SuperTest {
    get(url: string): Test
    post(url: string): Test
    put(url: string): Test
    delete(url: string): Test
    patch(url: string): Test
    options(url: string): Test
    head(url: string): Test
  }

  interface SuperTestWithAgent extends SuperTest {
    agent(app: unknown, options?: Record<string, unknown>): SuperTestWithAgent
  }

  interface SuperTestStatic extends SuperTestWithAgent {
    agent(app: unknown, options?: Record<string, unknown>): SuperTestWithAgent
  }

  declare const supertest: SuperTestStatic
  export = supertest
}
