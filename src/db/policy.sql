create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'request-documents');


create policy "Allow authenticated read"
on storage.objects
for select
to authenticated
using (bucket_id = 'request-documents');

CREATE POLICY "Allow select for all"
ON audit_log
FOR SELECT
USING (true);