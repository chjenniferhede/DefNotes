import { Hono } from 'hono'
import { cors } from 'hono/cors'
import notebookRoutes from './routes/notebook.js'

const app = new Hono()

// middleware to allow requests from any origin
app.use('/*', cors())

// the base request returns this
app.get('/', (c) => c.text('Hello DefNote!'))

// mount notebooks router at /notebooks
app.route('/notebooks', notebookRoutes)

export default app
