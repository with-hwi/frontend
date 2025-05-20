// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/example', () => {
    return HttpResponse.json({ message: 'Hello World!' })
  }),
]
