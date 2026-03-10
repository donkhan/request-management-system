delete from audit_log;
delete from document;
delete from request;
delete from employee;
delete from department;


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
