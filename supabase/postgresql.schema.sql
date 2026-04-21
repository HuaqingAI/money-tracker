\set postgres_password `echo "$POSTGRES_PASSWORD"`
\set authenticator_password `echo "$AUTHENTICATOR_PASSWORD"`

select format('alter role supabase_auth_admin with password %L', :'postgres_password') as sql
\gexec

select format('alter role authenticator with password %L', :'authenticator_password') as sql
\gexec
