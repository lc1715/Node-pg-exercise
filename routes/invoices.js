const express = require('express')

const ExpressError = require('../expressError')

const router = express.Router()
const db = require('../db')


/**
 * To get all invoices. {invoices: [{id, comp_code}, ...]}
 */
router.get('/', async (req, resp, next) => {
    try {
        const results = await db.query('SELECT id, comp_code FROM invoices ORDER BY id')
        return resp.json({ invoices: results.rows })
    } catch (e) {
        return next(e)
    }
})

/**
 * To get one invoice. 
 * {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
 */
router.get('/:id', async (req, resp, next) => {
    try {
        const { id } = req.params
        const results = await db.query(`
        SELECT id, amt, paid, add_date, paid_date, code, name, description
        FROM invoices
        JOIN companies
        ON companies.code = invoices.comp_code
        WHERE id = $1`,
            [id])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with an invalid id of ${id}`, 404)
        }
        return resp.json({
            invoice: {
                id: results.rows[0].id,
                amt: results.rows[0].amt,
                paid: results.rows[0].paid,
                add_date: results.rows[0].add_date,
                paid_date: results.rows[0].paid_date,
                company: {
                    code: results.rows[0].code,
                    name: results.rows[0].name,
                    description: results.rows[0].description
                }
            }
        })
    } catch (e) {
        return next(e)
    }
})


/**
 * To add an invoice to an exisiting company code. {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post('/', async (req, resp, next) => {
    try {
        const { comp_code, amt } = req.body
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])
        return resp.status(201).json({ invoice: results.rows[0] })
    } catch (err) {
        return next(err)
    }
})

/**
 * To update an invoice:
 * Change {amt, paid}
 * if paying invoice: paid_date: today's date if paying unpaid invoice
 * if not paying invoice: paid_date: null
 * else keep current paid date
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 * today's date: const date = new Date();
 */
router.put('/:id', async (req, resp, next) => {
    try {
        const { id } = req.params
        const { amt, paid } = req.body

        let paid_dateResult = await db.query(`SELECT paid_date FROM invoices WHERE id=$1`, [id])

        let paid_date = paid_dateResult.rows[0].paid_date

        if (!paid_date && paid === true) {
            paid_date = new Date()
        } else if (paid === false) {
            paid_date = null
        } else {
            paid_date = paid_date
        }

        const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paid_date, id])

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't update invoice with an invalid id of ${id}`, 404)
        }

        return resp.json({ invoice: result.rows[0] })
    } catch (err) {
        return next(err)
    }
})

/**
 * To delete an invoice
 */
router.delete('/:id', async (req, resp, next) => {
    try {
        const { id } = req.params

        const result = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`, [id])

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't delete invoice with an invalid id of ${id}`, 404)
        }

        return resp.json({ status: 'deleted' })
    } catch (e) {
        return next(e)
    }
})


module.exports = router

