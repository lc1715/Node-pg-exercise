process.env.NODE_ENV = 'test';

const request = require('supertest')

const app = require('../app')

const db = require('../db')

let testCompany;
let testInvoice;

beforeEach(async () => {
    const companiesResult = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('testCode' , 'Test Name', 'Maker of tests')
    RETURNING code, name, description`)

    testCompany = companiesResult.rows[0]

    const invoicesResult = await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('testCode', 100, false, null)
    RETURNING comp_code, amt, paid, paid_date`)

    testInvoice = invoicesResult.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})


describe('GET /companies', () => {
    test('To get an array with all companies in it', async () => {

        const resp = await request(app).get('/companies')

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ companies: [{ code: testCompany.code, name: testCompany.name }] })
    })
})

describe('GET /companies/:code', () => {
    test('To get a single company and its invoices', async () => {

        const resp = await request(app).get(`/companies/${testCompany.code}`)

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ company: { code: testCompany.code, name: testCompany.name, description: testCompany.description, invoices: [expect.any(Number)] } })
    })
})

describe('POST /companies', () => {
    test('To create a new company', async () => {

        const resp = await request(app).post(`/companies`).send({
            code: 'testComp2', name: 'Test Comp2', description: 'making Test Comp2'
        })

        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({ company: { code: 'testComp2', name: 'Test Comp2', description: 'making Test Comp2' } })
    })
})

describe('PUT /companies/:code', () => {
    test(`To update a company`, async () => {

        const resp = await request(app).put(`/companies/${testCompany.code}`).send({ name: 'Test Company3', description: 'make candy' })

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({ company: { code: testCompany.code, name: 'Test Company3', description: 'make candy' } })
    })
})



describe('DELETE /companies/:code', () => {
    test('To delete a company', async () => {

        const resp = await request(app).delete(`/companies/${testCompany.code}`)

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ msg: 'Deleted!' })
    })
})


