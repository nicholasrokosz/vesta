# Restore a database dump

[Video demonstrating the process](https://www.loom.com/share/30cda4c6fba94ea09cb4de8a8b45f8c7?sid=ba4284d1-be1a-4a11-a4a9-c408fdf4dc7a)

Run the following commands to restore a database dump:

```
./scripts/local-restore-db.sh <sql_dump_file>
```

If it's a production copy, update your user's Account auth0 id to the one in vine.ts (via Postico or y db:studio).

```
UPDATE "Account" SET "providerAccountId" = '<dev_auth0_id>' WHERE "Account"."userId" = (select id from "User" where "email" = '<email>');
```

Also, update the user's organizationId if you're looking at a particular organization.

```
UPDATE "User" SET "organizationId" = '<org_id>' WHERE "email" = '<email>';
```
