export default async function (fastify, options) {
  try {
    console.log('server started')
    fastify.get('/', async function (req, reply) {
      console.log('req')
      return { hello: '/' }
    })
    fastify.get('/:id', async function (req, reply) {
      console.log(req.params)
      return { hello: ':id' }
    })
  } catch (e) {
    console.log('error:', e)
  }
}
