import { UserInputError, ForbiddenError } from 'apollo-server-micro'

const knex = require('knex')({
  client: 'pg',
  version: '10.6',
  connection: {
    host: process.env.DATABASE_URL,
    database: process.env.DATABASE_NAME,
    user: 'service_tool',
    password: process.env.TOOL_DATABASE_PASSWORD
  },
  searchPath: 'sc_tool'
})

const isValidUUID = uuid =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  )

export default {
  Query: {
    hello: () => 'toolkit service says hello',
    toolkits: async () => await knex('toolkit').where({ visibility: 'PUBLIC' }),
    toolkit: async (root, { id }) => {
      if (!isValidUUID(id)) throw new UserInputError('INVALID_UUID')
      const kit = (await knex('toolkit').where({ id }))[0]
      if (!kit) throw new UserInputError('DOES_NOT_EXIST')
      return kit
    }
  },

  Mutation: {
    editToolkit: async (
      root,
      { toolkit: { id, title, description, learning, canvas } },
      { userRole }
    ) => {
      if (userRole !== 'ADMIN') throw new ForbiddenError('UNAUTHORIZED')

      const toolkit = isValidUUID(id)
        ? (await knex('toolkit')
            .select('title', 'description_markdown', 'learning', 'canvas')
            .where({ id }))[0]
        : []
      if (toolkit.length === 0) throw new UserInputError('INVALID_ID')

      if (title) toolkit.title = title
      if (description) toolkit.description_markdown = description
      if (learning) toolkit.learning = learning
      if (canvas) toolkit.canvas = canvas

      return (await knex('toolkit')
        .where({ id })
        .update(toolkit)
        .returning('*'))[0]
    }
  },

  Toolkit: {
    canvas: ({ canvas }) => JSON.stringify(canvas)
  }
}
