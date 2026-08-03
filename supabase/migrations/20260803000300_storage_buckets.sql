insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('invoice-pdfs', 'invoice-pdfs', false, 10485760, array['application/pdf']),
  ('invoice-xmls', 'invoice-xmls', false, 5242880, array['application/xml', 'text/xml']),
  ('company-certificates', 'company-certificates', false, 5242880, array['application/x-pkcs12', 'application/octet-stream']),
  ('documents', 'documents', false, 20971520, array['application/pdf', 'image/png', 'image/jpeg', 'text/xml', 'application/xml'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Company members can read invoice pdfs" on storage.objects;
create policy "Company members can read invoice pdfs"
on storage.objects
for select
using (
  bucket_id = 'invoice-pdfs'
  and exists (
    select 1
    from public.company_members cm
    where cm.company_id::text = (storage.foldername(name))[1]
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  )
);

drop policy if exists "Company members can read invoice xmls" on storage.objects;
create policy "Company members can read invoice xmls"
on storage.objects
for select
using (
  bucket_id = 'invoice-xmls'
  and exists (
    select 1
    from public.company_members cm
    where cm.company_id::text = (storage.foldername(name))[1]
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  )
);

drop policy if exists "Company members can read documents" on storage.objects;
create policy "Company members can read documents"
on storage.objects
for select
using (
  bucket_id = 'documents'
  and exists (
    select 1
    from public.company_members cm
    where cm.company_id::text = (storage.foldername(name))[1]
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  )
);

drop policy if exists "Company owners can read certificates" on storage.objects;
create policy "Company owners can read certificates"
on storage.objects
for select
using (
  bucket_id = 'company-certificates'
  and exists (
    select 1
    from public.company_members cm
    where cm.company_id::text = (storage.foldername(name))[1]
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
      and cm.role = 'owner'
  )
);
