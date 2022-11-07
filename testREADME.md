# test

## Setup

This is [nodejs](https://nodejs.org/en/) project.

-   When running for the first time, run `npm install`
-   You can either run code in `/src` folder with the `npm run dev`
    command or you can compile it and run with nodemon using
    `npm run build` command
-   When the project is running, the listener will be on
    `localhost:9724`
-   SwaggerUI is reachable on `localhost:9724/docs`
-   You can configure on which port the

### Prisma

We are using Prisma.io (<https://www.prisma.io/>) to connect to a database. 
Prisma.io is a ORM that enables working with a database via a
programming interface directly in node.js code.

The connection metadata is in the file `prisma/schema.prisma`. To get
syntax highlighting for `.prisma` files in vscode you can add the
[Prisma extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma).

To be able to connect the database with the prisma client you need to
set up the connection URL. This is set up as an environment variable
`DATABASE_URL` in the `.env` file. 
There are multiple options, for development it is easiest and fastest to use a SQLite database.
This is already set up in the project. Alternative is to use MySQL.

#### MySQL instructions

The instruction how to configure the
variable for a MySQL database can be found
[here](https://www.prisma.io/docs/concepts/database-connectors/mysql).
It will be of the form:

    DATABASE_URL="mysql://history-dapp:password@localhost:9080/mysql"

We need to encode special characters in the password with
percent-encoding (<https://stackoverflow.com/a/68213745>).


### Working with Prisma

The metadata used to generate the types to work with the prisma client
in the code, is defined in `prisma/schema.prisma`. There is already a
file generated for our data model, but to sync the database you will use
the [db
push](https://www.prisma.io/docs/guides/database/prototyping-schema-db-push#prototyping-with-an-existing-migration-history)
command (alternative is to use
[migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)).

``` {.bash}
npx prisma db push
```

This will create an empty table in the database.

Once you generate the prisma schema, you can generate code for the client using

``` {.bash}
npx prisma generate
```

You can now create a new Prisma client which can read/write to the
database. In the project this is done in `src/services/databaseService.ts`.