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

import uuid from 'uuid/v4'

const isValidUUID = uuid =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  )

export default {
  Query: {
    hello: () => 'toolkit service says hello',
    toolkits: async (root, _, { userRole }) =>
      await knex('toolkit').where({
        ...(userRole !== 'ADMIN' && { visibility: 'PUBLIC' })
      }),
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
    },

    createToolkit: async (root, _, { userRole }) => {
      if (userRole !== 'ADMIN') throw new ForbiddenError('UNAUTHORIZED')
      return (await knex('toolkit')
        .insert({
          id: uuid(),
          title: `new-${Date.now()}`,
          description: '',
          description_markdown: '',
          learning: '',
          workflow: '',
          canvas: JSON.stringify({
            meta: {
              width: 1,
              spacing: 0.01
            },
            boxes: []
          })
        })
        .returning('*'))[0]
    },

    deleteToolkit: async (root, { id }, { userRole }) => {
      if (userRole !== 'ADMIN') throw new ForbiddenError('UNAUTHORIZED')
      await knex('toolkit')
        .where({ id })
        .del()
    },

    setVisibility: async (root, { id, status }, { userRole }) => {
      if (userRole !== 'ADMIN') throw new ForbiddenError('UNAUTHORIZED')
      if (!['PUBLIC', 'UNLISTED'].includes(status))
        throw new UserInputError('INVALID_STATUS')
      return (await knex('toolkit')
        .where({ id })
        .update({ visibility: status })
        .returning('*'))[0]
    }
  },

  Toolkit: {
    canvas: ({ canvas }) => JSON.stringify(canvas)
  }
}
