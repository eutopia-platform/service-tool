const knex = require('knex')({
  client: 'pg',
  version: '10.6',
  connection: {
    host: process.env.DATABASE_URL,
    database: process.env.DATABASE_NAME,
    user: 'service_tool',
    password: process.env.TOOL_DATABASE_PASSWORD
  }
})

const dbSchema = 'sc_tool'
const select = async cond => await knex.select().withSchema(dbSchema).from('toolkit').where(cond ? cond : {})
const selectSingle = async cond => await select(cond) |> (#.length ? #[0] : null)

export default {
  hello: () => 'hello there!',

  toolkits: async () => await select()
}
