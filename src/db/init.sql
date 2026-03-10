
CREATE TABLE role (
  name text PRIMARY KEY
);

CREATE TABLE department (
  name text NOT NULL UNIQUE,
  head_email text,
  parent_department text references department(name)
);

CREATE TABLE employee (
  email text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'EMPLOYEE',
  department text NOT NULL REFERENCES department(name),
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_status_check
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

create table request (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by text not null references employee(email),
  current_approver text  references employee(email),
  department text NOT NULL REFERENCES department(name),
  status text not null default 'Pending',
  type text not null default 'OTHER',
  created_at timestamp with time zone default now()
);

create table document (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references request(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  uploaded_at timestamp with time zone default now()
);


create table audit_log (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references request(id) on delete cascade,
  action text not null, 
  -- SUBMITTED
  -- APPROVED
  -- REJECTED
  -- REJECTED_WITH_EDIT
  -- FORWARDED
  acted_by text not null,        -- email of actor
  acted_to text,                 -- next approver (nullable)
  comment text not null,
  department text NOT NULL REFERENCES department(name),
  created_at timestamp with time zone default now()
);

insert into role (name)
values
 ('FACULTY'),
 ('DIRECTOR'),
 ('SOFTWARE DEVELOPER'),
 ('PRO-VC'),
 ('ACCOUNTANT');


insert into department (name, head_email, parent_department)
VALUES
('VC-OFFICE','provc.praveen@cmr.edu.in',NULL),
('SSCS','ashokkumar.t@cmr.edu.in','VC-OFFICE'),
('ACCOUNTS','praveenkumar.r@cmr.edu.in','VC-OFFICE');


INSERT INTO employee (email, name, role, department,  status)
VALUES
('provc.praveen@cmr.edu.in',  'Praveen',  'PRO-VC', 'VC-OFFICE',  'APPROVED'),
('ashokkumar.t@cmr.edu.in',   'Ashok Kumar', 'DIRECTOR', 'SSCS',  'APPROVED'),
('kamil.k@cmr.edu.in',        'Kamil Khan A', 'FACULTY', 'SSCS',  'APPROVED'),
('praveenkumar.r@cmr.edu.in',  'Praveen Kumar',  'ACCOUNTANT', 'ACCOUNTS',  'APPROVED');


insert into department (name, head_email, parent_department)
VALUES
('VC-OFFICE','23f3004493@ds.study.iitm.ac.in',NULL),
('SSCS','routetokamil@gmail.com','VC-OFFICE'),
('ACCOUNTS','routetodanish@gmail.com','VC-OFFICE');


INSERT INTO employee (email, name, role, department,  status)
VALUES
('23f3004493@ds.study.iitm.ac.in',  'Praveen',  'PRO-VC', 'VC-OFFICE',  'APPROVED'),
('routetokamil@gmail.com',   'Ashok Kumar', 'DIRECTOR', 'SSCS',  'APPROVED'),
('kamil.k@cmr.edu.in',        'Kamil Khan A', 'FACULTY', 'SSCS',  'APPROVED'),
('routetodanish@gmail.com',  'Praveen Kumar',  'ACCOUNTANT', 'ACCOUNTS',  'APPROVED');



