const { validationResult } = require('express-validator')
const Helpers = require('../libs/helpers')

class InquiryController {
  async inquire (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'おといあわせにしっぱいしました' })

    const { content, email, categoryId } = req.body
    const body = {
      token: process.env.REGRET_TOKEN,
      content,
      email,
      category_id: categoryId
    }
    const options = {
      uri: `${process.env.REGRET_URL}/api/v1/inquiry`,
      method: 'POST',
      json: true,
      body
    }
    await Helpers.request(options).catch((e) => {
      return res.status(400).json({ msg: 'おといあわせにしっぱいしました' })
    })

    return res.status(200).json({})
  }
}

module.exports = new InquiryController()
