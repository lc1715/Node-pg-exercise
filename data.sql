
\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS industries_companies;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;


CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE industries_companies (
  industry_code text NOT NULL REFERENCES industries,
  company_code text NOT NULL REFERENCES companies,
  PRIMARY KEY(industry_code, company_code)
  );

  CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);


INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries
  VALUES ('tech', 'technology'),
         ('comp', 'computers'),
         ('acct', 'accounting');

INSERT INTO industries_companies
  VALUES ('tech', 'apple'),
          ('comp', 'apple'),
          ('tech', 'ibm'),
          ('comp', 'ibm');



