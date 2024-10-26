-- Create storage bucket for manuals if it doesn't exist
insert into storage.buckets (id, name, public)
values ('manuals', 'manuals', true)
on conflict (id) do nothing;

-- Enable public access to manuals bucket
update storage.buckets
set public = true
where id = 'manuals';

-- Create storage policies for manuals bucket
create policy "Public Access"
    on storage.objects for select
    using ( bucket_id = 'manuals' );

create policy "Authenticated users can upload"
    on storage.objects for insert
    with check (
        bucket_id = 'manuals'
        and auth.role() = 'authenticated'
    );

create policy "Users can update own uploads"
    on storage.objects for update
    using (
        bucket_id = 'manuals'
        and auth.uid() = owner
    );

create policy "Users can delete own uploads"
    on storage.objects for delete
    using (
        bucket_id = 'manuals'
        and auth.uid() = owner
    );