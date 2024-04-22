const express = require('express')

const ExpressError = require('../expressError')
const slugify = require('slugify')

const router = express.Router()
const db = require('../db')


router.get('/', async (req, resp, next) => {
    try {
        const result = await db.query(`
        SELECT name, company_code
        FROM industries
        LEFT JOIN industries_companies
        ON industries.code = industries_companies.industry_code`)

        return resp.json({ industries: result.rows })
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, resp, next) => {
    try {
        let { name } = req.body

        let code = slugify(name, { lower: true })

        const results = await db.query(`INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING code, name`, [code, name])
        return resp.status(201).json({ industries: results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

//To add a company to an industry
router.post('/:industry_code', async (req, resp, next) => {
    try {
        const { industry_code } = req.params
        const { company_code } = req.body

        const result = await db.query('INSERT INTO industries_companies (industry_code, company_code) VALUES ($1, $2) RETURNING industry_code, company_code', [industry_code, company_code])

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't update industries with an invalid code of ${code}`, 404)
        }

        return resp.json({ industries: result.rows[0] })
    } catch (e) {
        return next(e)
    }
})


module.exports = router
