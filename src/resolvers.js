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

export default {
  Query: {
    hello: () => 'toolkit service says hello',
    toolkits: async () => await knex('toolkit').select()
  }
}
