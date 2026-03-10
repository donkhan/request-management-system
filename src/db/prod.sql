delete from audit_log;
delete from document;
delete from request;
delete from employee;
delete from department;


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
