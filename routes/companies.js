const express = require('express')

const ExpressError = require('../expressError')
const slugify = require('slugify')

const router = express.Router()
const db = require('../db')


//To get all companies code and name:
router.get('/', async (req, resp, next) => {
    try {
        const results = await db.query('SELECT code, name FROM companies')

        return resp.json({ companies: results.rows })
    } catch (e) {
        return next(e)
    }
})


//To get a single company and its invoices: 
//{ company: { code, name, description, invoices: [id, ...], industries[industry, ...] } } 

router.get('/:code', async (req, resp, next) => {
    try {
        const { code } = req.params

        const companyResult = await db.query(`
        SELECT code, name, description FROM companies
        WHERE code=$1`, [code])

        const invoicesResult = await db.query(`
        SELECT id FROM invoices 
        WHERE comp_code=$1`, [code])

        const industriesNameResult = await db.query(`
        SELECT i.name
        FROM companies AS c
        LEFT JOIN industries_companies AS ic
        ON c.code = ic.company_code
        LEFT JOIN industries AS i
        ON ic.industry_code = i.code
        WHERE c.code=$1`, [code])

        const companyInfo = companyResult.rows[0]

        const idsArr = invoicesResult.rows.map(obj => obj.id)

        const industriesArr = industriesNameResult.rows.map(obj => obj.name)

        companyInfo.invoices = idsArr
        companyInfo.industries = industriesArr

        return resp.json({ company: companyInfo })
    } catch (e) {
        return next(e)
    }
})


//To create a single company. {company: {code, name, description}}
router.post('/', async (req, resp, next) => {
    try {
        let { name, description } = req.body

        let code = slugify(name, { lower: true })

        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description])
        return resp.status(201).json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

//To update a company
router.put('/:code', async (req, resp, next) => {
    try {
        const { code } = req.params
        const { name, description } = req.body

        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company with an invalid code of ${code}`, 404)
        }

        return resp.json({ company: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

//To delete a company
router.delete('/:code', async (req, resp, next) => {
    try {
        const { code } = req.params

        const result = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code', [code])

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't delete company with an invalid code of ${code}`, 404)
        }

        return resp.json({ msg: 'Deleted!' })
    } catch (e) {
        return next(e)
    }
})


module.exports = router
