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
    INSERT INTO invoices (id, comp_code, amt, paid, paid_date)
    VALUES (1, 'testCode', 100, false, null)
    RETURNING id, comp_code, amt, paid, paid_date`)

    testInvoice = invoicesResult.rows[0]
    console.log('testInvoice%%%%%', testInvoice)
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})


describe('GET /invoices', () => {
    test('To get all invoices', async () => {

        const resp = await request(app).get('/invoices')

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({ invoices: [{ id: testInvoice.id, comp_code: testInvoice.comp_code }] })
    })
})

describe('GET /invoices/:id', () => {
    test(`To get a single invoice and its company`, async () => {

        const resp = await request(app).get(`/invoices/${testInvoice.id}`)

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({ invoice: { id: testInvoice.id, amt: 100, paid: false, add_date: '2024-04-11T07:00:00.000Z', paid_date: null, company: testCompany } })
    })
})

describe('POST /invoices', () => {
    test(`To delete an invoice`, async () => {

        const resp = await request(app).post(`/invoices`).send({ comp_code: testCompany.code, amt: 300 })

        expect(resp.statusCode).toBe(201)
        expect(resp.body).toEqual({ invoice: { id: expect.any(Number), comp_code: testCompany.code, amt: 300, paid: false, add_date: '2024-04-11T07:00:00.000Z', paid_date: null } })
    })
})

describe('PUT /invoices/:id', () => {
    test(`To update an invoice`, async () => {

        const resp = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 200 })

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({ invoice: { id: testInvoice.id, comp_code: testCompany.code, amt: 200, paid: false, add_date: '2024-04-11T07:00:00.000Z', paid_date: null } })
    })
})

describe('DELETE /invoices/:id', () => {
    test(`To delete an invoice`, async () => {

        const resp = await request(app).delete(`/invoices/${testInvoice.id}`)

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual({ status: 'deleted' })
    })
})
