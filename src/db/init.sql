-- =========================================
-- DROP TABLES (Dependency Order)
-- =========================================
drop table if exists requests;
drop table if exists employees;
drop table if exists departments;

-- =========================================
-- DEPARTMENTS
-- =========================================
create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- =========================================
-- EMPLOYEES
-- =========================================
create table employees (
  id uuid primary key default gen_random_uuid(),
  email text primary key not null unique,
  name text not null,
  role text not null,
  dept_id uuid not null references departments(id),
  reports_to uuid references employees(id)
);

-- =========================================
-- REQUESTS
-- =========================================
create table requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid not null references employees(id),
  current_approver uuid not null references employees(id),
  status text not null default 'Pending',
  created_at timestamp with time zone default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  uploaded_at timestamp with time zone default now()
);

-- =========================================
-- INSERT DEPARTMENTS
-- =========================================
insert into departments (name)
values 
('SSCS'),
('SOM'),
('VC-OFFICE');

insert into employees (email, role, dept_id,reports_to)
values
('provc.praveen@cmr.edu.in',  'ProVC', 'VC-OFFICE',null),
('ashokkumar.t@cmr.edu.in',  'Director','SSCS','provc.praveen@cmr.edu.in'),
('kamil.k@cmr.edu.in',  'Faculty','SSCS','ashokkumar.t@cmr.edu.in')
;


insert into employees (email, role, dept_id,reports_to)
values
('routetokamil@gmail.com',  'DIRECTOR', 'SSCS','provc.praveen@cmr.edu.in');
insert into employees (email, role, dept_id,reports_to)
values
('23f3004493@ds.study.iitm.ac.in',  'PROVC', 'VC-OFFICE',null);

update employees set reports_to = 'ashokkumar.t@cmr.edu.in' where email = 'kamil.k@cmr.edu.in';




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
ON request_audit_logs
FOR SELECT
USING (true);