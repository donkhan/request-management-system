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

-- =========================================
-- INSERT EMPLOYEES (WITHOUT hierarchy first)
-- =========================================
insert into employees (email, name, role, dept_id)
values
('routetokamil@gmail.com', 'Faculty User', 'Faculty',
 (select id from departments where name = 'SSCS')),

('kamil.k@cmr.edu.in', 'Director User', 'Director',
 (select id from departments where name = 'SSCS')),

('23f3004493@ds.study.iitm.ac.in', 'Pro VC User', 'ProVC',
 (select id from departments where name = 'VC-OFFICE'));

-- =========================================
-- SET HIERARCHY (reports_to)
-- Faculty → Director → Pro VC
-- =========================================

-- Faculty reports to Director
update employees
set reports_to = (
    select id from employees where email = 'kamil.k@cmr.edu.in'
)
where email = 'routetokamil@gmail.com';

-- Director reports to Pro VC
update employees
set reports_to = (
    select id from employees where email = '23f3004493@ds.study.iitm.ac.in'
)
where email = 'kamil.k@cmr.edu.in';

-- Pro VC reports to NULL (top level)
update employees
set reports_to = null
where email = '23f3004493@ds.study.iitm.ac.in';



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